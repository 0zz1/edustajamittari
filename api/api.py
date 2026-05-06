#!/usr/bin/env python3
"""
Edustajamittari API
Uses Postgres in production (DATABASE_URL env var), SQLite locally.
"""

import os
from contextlib import contextmanager
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL", "")
USE_POSTGRES  = DATABASE_URL.startswith("postgres")


@contextmanager
def get_db():
    if USE_POSTGRES:
        import psycopg2, psycopg2.extras
        url = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        conn = psycopg2.connect(url)
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()
    else:
        import sqlite3
        conn = sqlite3.connect(os.environ.get("DB_PATH", "eduskunta.db"))
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()


def fetchall(conn, sql, params=()):
    if USE_POSTGRES:
        import psycopg2.extras
        pg_sql = sql.replace("?", "%s")
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(pg_sql, params)
            return [dict(r) for r in cur.fetchall()]
    rows = conn.execute(sql, params).fetchall()
    return [dict(r) for r in rows]


def fetchone(conn, sql, params=()):
    rows = fetchall(conn, sql, params)
    return rows[0] if rows else None


@app.get("/api/leaderboard")
def leaderboard():
    sort  = request.args.get("sort", "attendance")
    party = request.args.get("party", "")
    limit = min(int(request.args.get("limit", 200)), 200)
    order = "ASC" if request.args.get("order") == "asc" else "DESC"
    sort_col = {"attendance":"a.attendance_pct","participation":"v.participation_pct","abstain":"v.abstain_pct"}.get(sort, "v.participation_pct")
    where, params = "WHERE 1=1", []
    if party:
        where += " AND m.party = ?"; params.append(party)
    sql = f"""SELECT m.id, m.name, m.party, m.constituency, m.photo_url,
        a.attendance_pct, a.present_count, a.absent_count, a.total_sessions,
        v.participation_pct, v.abstain_pct, v.voted_jaa, v.voted_ei, v.voted_tyhja, v.voted_poissa, v.total_votes
        FROM mp m
        LEFT JOIN v_mp_attendance a ON a.mp_id = m.id
        LEFT JOIN (
            SELECT mp_id,
                ROUND(100.0 * SUM(CASE WHEN choice IN ('jaa','ei','tyhja') THEN 1 ELSE 0 END) / COUNT(*), 1) AS participation_pct,
                ROUND(100.0 * SUM(CASE WHEN choice = 'tyhja' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS abstain_pct,
                SUM(CASE WHEN choice='jaa' THEN 1 ELSE 0 END) AS voted_jaa,
                SUM(CASE WHEN choice='ei' THEN 1 ELSE 0 END) AS voted_ei,
                SUM(CASE WHEN choice='tyhja' THEN 1 ELSE 0 END) AS voted_tyhja,
                SUM(CASE WHEN choice='poissa' THEN 1 ELSE 0 END) AS voted_poissa,
                COUNT(*) AS total_votes
            FROM mp_vote mv
            JOIN vote vt ON vt.id = mv.vote_id
            WHERE vt.date >= '2023-01-24'
            GROUP BY mp_id
        ) v ON v.mp_id = m.id
        {where}
        AND v.total_votes IS NOT NULL
        ORDER BY {sort_col} {order} NULLS LAST LIMIT ?"""
    params.append(limit)
    with get_db() as conn:
        data = fetchall(conn, sql, params)
    for i, row in enumerate(data): row["rank"] = i + 1
    return jsonify({"count": len(data), "sort": sort, "data": data})


@app.get("/api/mp/<mp_id>")
def mp_profile(mp_id):
    with get_db() as conn:
        mp = fetchone(conn, """SELECT m.*,a.attendance_pct,a.present_count,a.absent_count,a.total_sessions,
            v.participation_pct,v.abstain_pct,v.voted_jaa,v.voted_ei,v.voted_tyhja,v.voted_poissa,v.total_votes
            FROM mp m LEFT JOIN v_mp_attendance a ON a.mp_id=m.id LEFT JOIN v_mp_voting v ON v.mp_id=m.id
            WHERE m.id=?""", (mp_id,))
        if not mp: return jsonify({"error":"MP not found"}), 404
        monthly = fetchall(conn, """SELECT strftime('%Y-%m',s.date) AS month,COUNT(*) AS total,SUM(a.present) AS present
            FROM attendance a JOIN session s ON s.id=a.session_id WHERE a.mp_id=?
            GROUP BY month ORDER BY month DESC LIMIT 12""", (mp_id,))
        by_topic = fetchall(conn, """SELECT v.topic,COUNT(*) AS total,
            SUM(CASE WHEN mv.choice IN ('jaa','ei','tyhja') THEN 1 ELSE 0 END) AS participated,
            SUM(CASE WHEN mv.choice='jaa' THEN 1 ELSE 0 END) AS jaa,
            SUM(CASE WHEN mv.choice='ei' THEN 1 ELSE 0 END) AS ei,
            ROUND(100.0*SUM(CASE WHEN mv.choice IN ('jaa','ei','tyhja') THEN 1 ELSE 0 END)/COUNT(*),1) AS participation_pct
            FROM mp_vote mv JOIN vote v ON v.id=mv.vote_id WHERE mv.mp_id=? GROUP BY v.topic ORDER BY total DESC""", (mp_id,))
        rank_row = fetchone(conn, """SELECT COUNT(*)+1 AS rank FROM v_mp_attendance WHERE attendance_pct>
            (SELECT attendance_pct FROM v_mp_attendance WHERE mp_id=?)""", (mp_id,))
    result = dict(mp)
    result["rank"] = rank_row["rank"] if rank_row else None
    result["monthly_attendance"] = monthly
    result["by_topic"] = by_topic
    return jsonify(result)


@app.get("/api/mp/<mp_id>/votes")
def mp_votes(mp_id):
    topic  = request.args.get("topic",""); choice = request.args.get("choice","")
    limit  = min(int(request.args.get("limit",50)),200); offset = int(request.args.get("offset",0))
    where, params = "WHERE mv.mp_id=?", [mp_id]
    if topic:  where += " AND v.topic=?";  params.append(topic)
    if choice: where += " AND mv.choice=?"; params.append(choice)
    with get_db() as conn:
        rows = fetchall(conn, f"""SELECT mv.vote_id,mv.choice,v.date,v.title,v.topic,v.result,v.yeas,v.nays
            FROM mp_vote mv JOIN vote v ON v.id=mv.vote_id {where} ORDER BY v.date DESC LIMIT ? OFFSET ?""",
            params+[limit,offset])
    return jsonify({"mp_id":mp_id,"count":len(rows),"data":rows})


@app.get("/api/vaalikone/questions")
def vaalikone_questions():
    topics = [t.strip() for t in request.args.get("topics","").split(",") if t.strip()]
    limit  = min(int(request.args.get("limit",10)),30)
    where, params = "", []
    if topics:
        where = f"WHERE v.topic IN ({','.join(['?']*len(topics))})"; params = topics
    with get_db() as conn:
        rows = fetchall(conn, f"""SELECT v.id,v.date,v.title,v.description,v.topic,v.result,v.yeas,v.nays,
            COUNT(mv.mp_id) AS mp_count,
            SUM(CASE WHEN mv.choice='jaa' THEN 1 ELSE 0 END) AS jaa_count,
            SUM(CASE WHEN mv.choice='ei'  THEN 1 ELSE 0 END) AS ei_count
            FROM vote v JOIN mp_vote mv ON mv.vote_id=v.id {where}
            GROUP BY v.id HAVING mp_count>150 AND jaa_count>20 AND ei_count>20
            ORDER BY v.date DESC LIMIT ?""", params+[limit])
    return jsonify({"count":len(rows),"data":rows})


@app.get("/api/vaalikone/match")
def vaalikone_match():
    raw = request.args.get("votes","")
    if not raw: return jsonify({"error":"votes param required"}),400
    user_votes = {}
    for pair in raw.split(","):
        parts = pair.strip().split(":")
        if len(parts)==2: user_votes[parts[0]] = parts[1].lower()
    if not user_votes: return jsonify({"error":"no valid votes"}),400
    placeholders = ",".join(["?"]*len(user_votes))
    with get_db() as conn:
        rows = fetchall(conn,f"""SELECT mv.mp_id,mv.vote_id,mv.choice,m.name,m.party,m.constituency
            FROM mp_vote mv JOIN mp m ON m.id=mv.mp_id WHERE mv.vote_id IN ({placeholders})""",
            list(user_votes.keys()))
    from collections import defaultdict
    mp_data = defaultdict(lambda:{"name":"","party":"","constituency":"","match":0,"total":0})
    for row in rows:
        mid = row["mp_id"]; mp_data[mid]["name"]=row["name"]; mp_data[mid]["party"]=row["party"]; mp_data[mid]["constituency"]=row["constituency"]
        uc = user_votes.get(row["vote_id"])
        if uc and row["choice"]!="poissa":
            mp_data[mid]["total"]+=1
            if uc==row["choice"]: mp_data[mid]["match"]+=1
    results = sorted([{"mp_id":mid,**d,"match_pct":round(100*d["match"]/d["total"],1) if d["total"] else 0} for mid,d in mp_data.items()],key=lambda x:x["match_pct"],reverse=True)
    for i,r in enumerate(results): r["rank"]=i+1
    return jsonify({"voted_on":len(user_votes),"count":len(results),"data":results})


@app.get("/api/parties")
def parties():
    with get_db() as conn:
        rows = fetchall(conn,"SELECT m.party,COUNT(*) AS mp_count,ROUND(AVG(a.attendance_pct),1) AS avg_attendance FROM mp m LEFT JOIN v_mp_attendance a ON a.mp_id=m.id WHERE m.party!='' GROUP BY m.party ORDER BY mp_count DESC")
    return jsonify(rows)


@app.get("/api/stats")
def stats():
    with get_db() as conn:
        return jsonify({t:fetchone(conn,f"SELECT COUNT(*) AS n FROM {t}")["n"] for t in ["mp","session","vote","mp_vote"]})


@app.get("/health")
def health(): return jsonify({"status":"ok"})

@app.get("/")
def index(): return jsonify({"service":"Edustajamittari API","version":"1.0"})


@app.get("/api/debug/votes")
def debug_votes():
    with get_db() as conn:
        sample = fetchall(conn, "SELECT id, date, title FROM vote LIMIT 5")
        nulls = fetchone(conn, "SELECT COUNT(*) as n FROM vote WHERE date IS NULL")
        dated = fetchone(conn, "SELECT COUNT(*) as n FROM vote WHERE date IS NOT NULL")
    return jsonify({"sample": sample, "null_dates": nulls["n"], "with_dates": dated["n"]})

if __name__=="__main__":
    app.run(debug=True, port=5000)