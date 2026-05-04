#!/usr/bin/env python3
"""
Edustajamittari data pipeline
Fetches MP data from avoindata.eduskunta.fi.
Postgres in production (DATABASE_URL), SQLite locally.

Usage:
    python pipeline.py            # full fetch
    python pipeline.py --update   # only new data
    python pipeline.py --stats    # print summary
"""

import os, sys, time, argparse
from datetime import datetime
from contextlib import contextmanager
import requests

BASE_URL      = "https://avoindata.eduskunta.fi/api/v1/tables"
DATABASE_URL  = os.environ.get("DATABASE_URL", "")
DB_PATH       = os.environ.get("DB_PATH", "eduskunta.db")
USE_POSTGRES  = DATABASE_URL.startswith("postgres")
PER_PAGE      = 100
REQUEST_DELAY = 0.3

http = requests.Session()
http.headers["User-Agent"] = "edustajamittari/1.0 (civic-tech)"


# ── DB helpers ───────────────────────────────────────────────────────────────

@contextmanager
def get_db():
    if USE_POSTGRES:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL.replace("postgres://", "postgresql://", 1))
        try:
            yield conn; conn.commit()
        finally:
            conn.close()
    else:
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()


def qmarks(n):
    return ",".join(["%s" if USE_POSTGRES else "?"] * n)


def execute(conn, sql, params=()):
    sql = sql.replace("?", "%s") if USE_POSTGRES else sql
    if USE_POSTGRES:
        with conn.cursor() as cur: cur.execute(sql, params)
    else:
        conn.execute(sql, params)


def executemany(conn, sql, rows):
    if not rows: return
    sql = sql.replace("?", "%s") if USE_POSTGRES else sql
    if USE_POSTGRES:
        with conn.cursor() as cur:
            for row in rows: cur.execute(sql, row)
    else:
        conn.executemany(sql, rows)


def fetchall(conn, sql, params=()):
    sql = sql.replace("?", "%s") if USE_POSTGRES else sql
    if USE_POSTGRES:
        import psycopg2.extras
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return [dict(r) for r in cur.fetchall()]
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


def init_db(conn):
    stmts = [
        "CREATE TABLE IF NOT EXISTS mp (id TEXT PRIMARY KEY, name TEXT NOT NULL, party TEXT, constituency TEXT, photo_url TEXT, active INTEGER DEFAULT 1)",
        "CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, date TEXT, number TEXT, type TEXT)",
        "CREATE TABLE IF NOT EXISTS attendance (mp_id TEXT NOT NULL, session_id TEXT NOT NULL, present INTEGER NOT NULL, PRIMARY KEY (mp_id, session_id))",
        "CREATE TABLE IF NOT EXISTS vote (id TEXT PRIMARY KEY, session_id TEXT, date TEXT, title TEXT, description TEXT, topic TEXT, result TEXT, yeas INTEGER, nays INTEGER)",
        "CREATE TABLE IF NOT EXISTS mp_vote (mp_id TEXT NOT NULL, vote_id TEXT NOT NULL, choice TEXT NOT NULL, PRIMARY KEY (mp_id, vote_id))",
        "CREATE TABLE IF NOT EXISTS sync_log (table_name TEXT, fetched_at TEXT, row_count INTEGER)",
        "CREATE INDEX IF NOT EXISTS idx_mpv_mp   ON mp_vote(mp_id)",
        "CREATE INDEX IF NOT EXISTS idx_mpv_vote ON mp_vote(vote_id)",
        "CREATE INDEX IF NOT EXISTS idx_att_mp   ON attendance(mp_id)",
    ]
    for s in stmts:
        execute(conn, s)
    conn.commit()
    print("  ✓ Schema ready")


def build_views(conn):
    if USE_POSTGRES:
        views = [
            """CREATE OR REPLACE VIEW v_mp_attendance AS
               SELECT a.mp_id, m.name, m.party, m.constituency,
                 COUNT(*) AS total_sessions, SUM(a.present) AS present_count,
                 ROUND(100.0*SUM(a.present)/COUNT(*),1) AS attendance_pct,
                 COUNT(*)-SUM(a.present) AS absent_count
               FROM attendance a JOIN mp m ON m.id=a.mp_id
               GROUP BY a.mp_id,m.name,m.party,m.constituency""",
            """CREATE OR REPLACE VIEW v_mp_voting AS
               SELECT mv.mp_id, m.name, m.party, m.constituency,
                 COUNT(*) AS total_votes,
                 SUM(CASE WHEN mv.choice='jaa'    THEN 1 ELSE 0 END) AS voted_jaa,
                 SUM(CASE WHEN mv.choice='ei'     THEN 1 ELSE 0 END) AS voted_ei,
                 SUM(CASE WHEN mv.choice='tyhja'  THEN 1 ELSE 0 END) AS voted_tyhja,
                 SUM(CASE WHEN mv.choice='poissa' THEN 1 ELSE 0 END) AS voted_poissa,
                 ROUND(100.0*SUM(CASE WHEN mv.choice IN ('jaa','ei','tyhja') THEN 1 ELSE 0 END)/COUNT(*),1) AS participation_pct,
                 ROUND(100.0*SUM(CASE WHEN mv.choice='tyhja' THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0),1) AS abstain_pct
               FROM mp_vote mv JOIN mp m ON m.id=mv.mp_id
               GROUP BY mv.mp_id,m.name,m.party,m.constituency"""
        ]
        for v in views:
            execute(conn, v)
    else:
        conn.executescript("""
            DROP VIEW IF EXISTS v_mp_attendance;
            CREATE VIEW v_mp_attendance AS
            SELECT a.mp_id,m.name,m.party,m.constituency,
              COUNT(*) AS total_sessions,SUM(a.present) AS present_count,
              ROUND(100.0*SUM(a.present)/COUNT(*),1) AS attendance_pct,
              COUNT(*)-SUM(a.present) AS absent_count
            FROM attendance a JOIN mp m ON m.id=a.mp_id GROUP BY a.mp_id;
            DROP VIEW IF EXISTS v_mp_voting;
            CREATE VIEW v_mp_voting AS
            SELECT mv.mp_id,m.name,m.party,m.constituency,COUNT(*) AS total_votes,
              SUM(mv.choice='jaa') AS voted_jaa,SUM(mv.choice='ei') AS voted_ei,
              SUM(mv.choice='tyhja') AS voted_tyhja,SUM(mv.choice='poissa') AS voted_poissa,
              ROUND(100.0*SUM(mv.choice IN ('jaa','ei','tyhja'))/COUNT(*),1) AS participation_pct,
              ROUND(100.0*SUM(mv.choice='tyhja')/NULLIF(COUNT(*),0),1) AS abstain_pct
            FROM mp_vote mv JOIN mp m ON m.id=mv.mp_id GROUP BY mv.mp_id;
        """)
    conn.commit()
    print("  ✓ Views built")


# ── API fetch ────────────────────────────────────────────────────────────────

def fetch_table(table, filters=None, max_pages=None):
    rows, page = [], 0
    while True:
        params = {"page": page, "perPage": PER_PAGE}
        if filters:
            for k, v in filters.items():
                params["columnName"] = k; params["columnValue"] = v; break
        try:
            resp = http.get(f"{BASE_URL}/{table}/rows", params=params, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"\n  ✗ {e}"); break
        data = resp.json()
        cols = data.get("columnNames", [])
        batch = data.get("rowData", [])
        if not batch: break
        for r in batch:
            rows.append(dict(zip(cols, r)) if isinstance(r, list) else r)
        print(f"  page {page}: {len(batch)} rows", end="\r", flush=True)
        page += 1
        if (max_pages and page >= max_pages) or len(batch) < PER_PAGE: break
        time.sleep(REQUEST_DELAY)
    print(f"  → {len(rows)} rows          ")
    return rows


# ── Helpers ──────────────────────────────────────────────────────────────────

def _int(v):
    try: return int(v)
    except: return 0

TOPICS = {
    "sosiaali":     ["sosiaali","terveys","sairaus","asiakasmaksu","vanhus"],
    "talous":       ["budjetti","talous","vero","määräraha","lisätalousarvio"],
    "ympäristö":    ["ympäristö","kaivos","ilmasto","luonto","metsä","energia"],
    "koulutus":     ["koulutus","opetus","yliopisto","koulu","varhaiskasvatus"],
    "turvallisuus": ["puolustus","nato","turvallisuus","poliisi","rikoslaki"],
    "maahanmuutto": ["maahanmuutto","turvapaikka","ulkomaalais","kansalaisuus"],
    "asuminen":     ["asuminen","asuntotuki","vuokra","rakentaminen"],
    "demokratia":   ["kansalaisaloite","vaali","äänestys","perustuslaki"],
    "liikenne":     ["liikenne","tie","rautatie","lentokenttä"],
}

def topic(title):
    t = (title or "").lower()
    for name, kws in TOPICS.items():
        if any(k in t for k in kws): return name
    return "muu"

def choice(raw):
    r = (raw or "").strip().lower()
    if r in ("jaa","ja","yes","1"):            return "jaa"
    if r in ("ei","no","nej","0"):             return "ei"
    if r in ("tyhjää","tyhja","tyhjä","blank"): return "tyhja"
    if r in ("poissa","absent"):               return "poissa"
    return ""
def sync_mps(conn):
    print("\n[1/4] MPs (from SaliDBAanestysEdustaja)...")
    rows = fetch_table("SaliDBAanestysEdustaja", max_pages=3)
    seen = {}
    for r in rows:
        mid = str(r.get("EdustajaHenkiloNumero",""))
        if mid and mid not in seen:
            name = f"{r.get('EdustajaEtunimi','')} {r.get('EdustajaSukunimi','')}".strip()
            seen[mid] = (mid, name, r.get("EdustajaRyhmaLyhenne","").strip(), "", "")
    data = list(seen.values())
    sql = "INSERT INTO mp (id,name,party,constituency,photo_url) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,party=EXCLUDED.party"
    executemany(conn, sql, data)
    execute(conn, "INSERT INTO sync_log VALUES (?,?,?)", ("mp", datetime.utcnow().isoformat(), len(data)))
    conn.commit()
    print(f"  ✓ {len(data)} MPs saved")


def sync_sessions(conn):
    print("\n[2/4] Sessions (SaliDBIstunto)...")
    rows = fetch_table("SaliDBIstunto")
    data = [(str(r.get("IstuntoId","")), r.get("IstuntoPvm",""), str(r.get("IstuntoNro","")), r.get("IstuntoTyyppi","")) for r in rows]
    executemany(conn, "INSERT INTO session (id,date,number,type) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING", data)
    execute(conn, "INSERT INTO sync_log VALUES (?,?,?)", ("session", datetime.utcnow().isoformat(), len(data)))
    conn.commit(); print(f"  ✓ {len(data)} sessions saved")


def sync_votes(conn, update_only=False):
    print("\n[3/4] Votes (SaliDBAanestys)...")
    existing = {r["id"] for r in fetchall(conn,"SELECT id FROM vote")} if update_only else set()
    rows = fetch_table("SaliDBAanestys")
    data = []
    for r in rows:
        vid = str(r.get("AanestysId") or r.get("Id",""))
        if vid in existing: continue
        data.append((vid, str(r.get("IstuntoId","")), r.get("AanestysPvm",""),
                     r.get("Otsikko",""), r.get("Kuvaus",""),
                     topic(r.get("Otsikko","")), r.get("Tulos",""),
                     _int(r.get("JaaLkm",0)), _int(r.get("EiLkm",0))))
    executemany(conn, "INSERT INTO vote (id,session_id,date,title,description,topic,result,yeas,nays) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING", data)
    execute(conn, "INSERT INTO sync_log VALUES (?,?,?)", ("vote", datetime.utcnow().isoformat(), len(data)))
    conn.commit(); print(f"  ✓ {len(data)} votes saved")


def sync_mp_votes(conn, update_only=False):
    print("\n[4/4] Per-MP choices (SaliDBAanestysEdustaja) — may take a while...")
    done = {r["vote_id"] for r in fetchall(conn,"SELECT DISTINCT vote_id FROM mp_vote")} if update_only else set()
    vote_ids = [r["id"] for r in fetchall(conn,"SELECT id FROM vote ORDER BY date DESC")]
    total = 0
    for i, vid in enumerate(vote_ids):
        if vid in done: continue
        print(f"  vote {i+1}/{len(vote_ids)} (id={vid})...", end="\r")
        rows = fetch_table("SaliDBAanestysEdustaja", filters={"AanestysId": vid})
        data = []
        for r in rows:
mid = str(r.get("EdustajaHenkiloNumero",""))
            c = choice(r.get("EdustajaAanestys") or r.get("Aanestys") or r.get("Tulos",""))
            if mid and c: data.append((mid, vid, c))
        if data:
            executemany(conn, "INSERT INTO mp_vote (mp_id,vote_id,choice) VALUES (?,?,?) ON CONFLICT(mp_id,vote_id) DO NOTHING", data)
            total += len(data)
        conn.commit()
        time.sleep(REQUEST_DELAY)
    execute(conn, "INSERT INTO sync_log VALUES (?,?,?)", ("mp_vote", datetime.utcnow().isoformat(), total))
    conn.commit(); print(f"\n  ✓ {total} MP-vote records saved")


def print_stats(conn):
    print("\n=== Database ===")
    for t in ["mp","session","vote","mp_vote"]:
        try: print(f"  {t:<12}: {fetchall(conn,f'SELECT COUNT(*) AS n FROM {t}')[0]['n']:>10,}")
        except: pass
    try:
        print("\n  Top 5 by attendance:")
        for r in fetchall(conn,"SELECT name,party,attendance_pct FROM v_mp_attendance ORDER BY attendance_pct DESC LIMIT 5"):
            print(f"    {r['name']:<28} {r['party']:<20} {r['attendance_pct']}%")
    except Exception as e:
        print(f"  (views not built yet: {e})")


def main():
    parser = argparse.ArgumentParser(description="Edustajamittari pipeline")
    parser.add_argument("--update",        action="store_true", help="Only fetch new data")
    parser.add_argument("--stats",         action="store_true", help="Print stats and exit")
    parser.add_argument("--skip-mp-votes", action="store_true", help="Skip the large mp_vote fetch")
    args = parser.parse_args()

    print(f"=== Edustajamittari pipeline — {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC ===")
    print(f"    DB: {'Postgres' if USE_POSTGRES else DB_PATH} | Mode: {'update' if args.update else 'full'}")

    with get_db() as conn:
        init_db(conn)
        if args.stats:
            print_stats(conn); return
        sync_mps(conn)
        sync_sessions(conn)
        sync_votes(conn, update_only=args.update)
        if not args.skip_mp_votes:
            sync_mp_votes(conn, update_only=args.update)
        else:
            print("\n[4/4] Skipped (--skip-mp-votes)")
        build_views(conn)
        print_stats(conn)

    print("\n✓ Done.")


if __name__ == "__main__":
    main()
