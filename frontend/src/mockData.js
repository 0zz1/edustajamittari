// Mock data for local development — replace with real API calls when backend is running

export const MOCK_LEADERBOARD = [
  { id:'1', name:'Anna Kontula',      party:'Vasemmistoliitto', constituency:'Pirkanmaa',       attendance_pct:97.2, participation_pct:98.1, abstain_pct:0.8, voted_jaa:891, voted_ei:703, voted_tyhja:15, voted_poissa:18, total_votes:1627, rank:1 },
  { id:'2', name:'Sari Essayah',      party:'KD',               constituency:'Savo-Karjala',    attendance_pct:96.8, participation_pct:97.4, abstain_pct:1.1, voted_jaa:980, voted_ei:412, voted_tyhja:18, voted_poissa:20, total_votes:1430, rank:2 },
  { id:'3', name:'Ville Niinistö',    party:'Vihreät',          constituency:'Varsinais-Suomi', attendance_pct:96.1, participation_pct:96.8, abstain_pct:1.4, voted_jaa:790, voted_ei:650, voted_tyhja:22, voted_poissa:25, total_votes:1487, rank:3 },
  { id:'4', name:'Maria Ohisalo',     party:'Vihreät',          constituency:'Helsinki',        attendance_pct:95.7, participation_pct:96.2, abstain_pct:1.6, voted_jaa:810, voted_ei:620, voted_tyhja:25, voted_poissa:28, total_votes:1483, rank:4 },
  { id:'5', name:'Elina Lepomäki',    party:'Kokoomus',         constituency:'Helsinki',        attendance_pct:95.3, participation_pct:97.0, abstain_pct:0.9, voted_jaa:950, voted_ei:380, voted_tyhja:14, voted_poissa:22, total_votes:1366, rank:5 },
  { id:'6', name:'Paavo Arhinmäki',   party:'Vasemmistoliitto', constituency:'Helsinki',        attendance_pct:94.9, participation_pct:95.5, abstain_pct:1.8, voted_jaa:760, voted_ei:610, voted_tyhja:28, voted_poissa:32, total_votes:1430, rank:6 },
  { id:'7', name:'Erkki Tuomioja',    party:'SDP',              constituency:'Helsinki',        attendance_pct:94.4, participation_pct:94.9, abstain_pct:2.1, voted_jaa:720, voted_ei:580, voted_tyhja:32, voted_poissa:38, total_votes:1370, rank:7 },
  { id:'8', name:'Sandra Bergqvist',  party:'RKP',              constituency:'Vaasa',           attendance_pct:93.8, participation_pct:95.1, abstain_pct:1.9, voted_jaa:860, voted_ei:420, voted_tyhja:29, voted_poissa:34, total_votes:1343, rank:8 },
  { id:'9', name:'Li Andersson',      party:'Vasemmistoliitto', constituency:'Varsinais-Suomi', attendance_pct:93.2, participation_pct:94.7, abstain_pct:2.2, voted_jaa:740, voted_ei:590, voted_tyhja:33, voted_poissa:40, total_votes:1403, rank:9 },
  { id:'10', name:'Antti Rinne',      party:'SDP',              constituency:'Uusimaa',         attendance_pct:92.7, participation_pct:93.8, abstain_pct:2.8, voted_jaa:700, voted_ei:560, voted_tyhja:42, voted_poissa:48, total_votes:1350, rank:10 },
  { id:'11', name:'Petteri Orpo',     party:'Kokoomus',         constituency:'Varsinais-Suomi', attendance_pct:88.3, participation_pct:91.2, abstain_pct:3.1, voted_jaa:920, voted_ei:290, voted_tyhja:46, voted_poissa:80, total_votes:1336, rank:11 },
  { id:'12', name:'Riikka Purra',     party:'Perussuomalaiset', constituency:'Uusimaa',         attendance_pct:85.1, participation_pct:88.4, abstain_pct:4.2, voted_jaa:840, voted_ei:310, voted_tyhja:62, voted_poissa:108, total_votes:1320, rank:12 },
  { id:'13', name:'Annika Saarikko',  party:'Keskusta',         constituency:'Varsinais-Suomi', attendance_pct:82.4, participation_pct:86.1, abstain_pct:4.8, voted_jaa:780, voted_ei:280, voted_tyhja:71, voted_poissa:130, total_votes:1261, rank:13 },
  { id:'14', name:'Heikki Autto',     party:'Kokoomus',         constituency:'Lappi',           attendance_pct:74.1, participation_pct:80.5, abstain_pct:7.2, voted_jaa:720, voted_ei:240, voted_tyhja:107, voted_poissa:181, total_votes:1248, rank:14 },
  { id:'15', name:'Pekka Aittakumpu', party:'Keskusta',         constituency:'Oulu',            attendance_pct:71.0, participation_pct:78.2, abstain_pct:9.1, voted_jaa:680, voted_ei:210, voted_tyhja:135, voted_poissa:213, total_votes:1238, rank:15 },
  { id:'16', name:'Lulu Ranne',       party:'Perussuomalaiset', constituency:'Pirkanmaa',       attendance_pct:73.4, participation_pct:69.3, abstain_pct:11.2, voted_jaa:760, voted_ei:200, voted_tyhja:167, voted_poissa:200, total_votes:1327, rank:16 },
  { id:'17', name:'Hanna Huttunen',   party:'Keskusta',         constituency:'Savo-Karjala',    attendance_pct:68.2, participation_pct:74.3, abstain_pct:10.8, voted_jaa:640, voted_ei:190, voted_tyhja:161, voted_poissa:237, total_votes:1228, rank:17 },
  { id:'18', name:'Jussi Halla-aho',  party:'Perussuomalaiset', constituency:'Helsinki',        attendance_pct:66.7, participation_pct:72.1, abstain_pct:12.4, voted_jaa:710, voted_ei:180, voted_tyhja:185, voted_poissa:249, total_votes:1324, rank:18 },
  { id:'19', name:'Tom Packalén',     party:'Perussuomalaiset', constituency:'Helsinki',        attendance_pct:64.3, participation_pct:68.4, abstain_pct:13.8, voted_jaa:690, voted_ei:160, voted_tyhja:206, voted_poissa:262, total_votes:1318, rank:19 },
  { id:'20', name:'Mikko Kärnä',      party:'Keskusta',         constituency:'Lappi',           attendance_pct:62.1, participation_pct:71.2, abstain_pct:14.1, voted_jaa:610, voted_ei:150, voted_tyhja:211, voted_poissa:280, total_votes:1251, rank:20 },
]

export const MOCK_MP = {
  id:'1', name:'Anna Kontula', party:'Vasemmistoliitto', constituency:'Pirkanmaa',
  photo_url: null,
  rank: 1,
  attendance_pct: 97.2, present_count: 310, absent_count: 9, total_sessions: 319,
  participation_pct: 98.1, abstain_pct: 0.8,
  voted_jaa: 891, voted_ei: 703, voted_tyhja: 15, voted_poissa: 18, total_votes: 1627,
  monthly_attendance: [
    { month:'2025-04', total:18, present:18 },
    { month:'2025-03', total:22, present:22 },
    { month:'2025-02', total:20, present:20 },
    { month:'2025-01', total:16, present:11 },
    { month:'2024-12', total:14, present:14 },
    { month:'2024-11', total:21, present:21 },
    { month:'2024-10', total:23, present:23 },
    { month:'2024-09', total:19, present:19 },
  ],
  by_topic: [
    { topic:'sosiaali',      total:312, participation_pct:98, jaa:198, ei:112 },
    { topic:'ympäristö',     total:201, participation_pct:99, jaa:178, ei:22  },
    { topic:'koulutus',      total:134, participation_pct:97, jaa:110, ei:23  },
    { topic:'talous',        total:289, participation_pct:96, jaa:92,  ei:196 },
    { topic:'turvallisuus',  total:178, participation_pct:88, jaa:55,  ei:122 },
    { topic:'maahanmuutto',  total:143, participation_pct:79, jaa:18,  ei:125 },
    { topic:'asuminen',      total:98,  participation_pct:97, jaa:84,  ei:14  },
    { topic:'demokratia',    total:72,  participation_pct:99, jaa:68,  ei:4   },
  ],
}

export const MOCK_MP_VOTES = [
  { vote_id:'v1', choice:'jaa',  date:'2025-04-15', title:'HE 12/2024 — Sosiaali- ja terveydenhuollon asiakasmaksulaki',    topic:'sosiaali',  result:'Hyväksyttiin', yeas:112, nays:88  },
  { vote_id:'v2', choice:'ei',   date:'2025-04-14', title:'HE 45/2024 — Puolustusmäärärahoja koskeva lisätalousarvio',     topic:'talous',    result:'Hyväksyttiin', yeas:143, nays:57  },
  { vote_id:'v3', choice:'jaa',  date:'2025-04-11', title:'HE 8/2024 — Varhaiskasvatuslain muutos',                        topic:'koulutus',  result:'Hyväksyttiin', yeas:167, nays:33  },
  { vote_id:'v4', choice:'ei',   date:'2025-04-09', title:'HE 71/2024 — Työttömyysturvan leikkaukset',                     topic:'sosiaali',  result:'Hyväksyttiin', yeas:104, nays:96  },
  { vote_id:'v5', choice:'tyhja',date:'2025-04-07', title:'HE 33/2024 — Kaivoslain uudistus',                              topic:'ympäristö', result:'Hylättiin',    yeas:88,  nays:112 },
  { vote_id:'v6', choice:'jaa',  date:'2025-04-04', title:'HE 19/2024 — Asumistuen uudistus',                              topic:'asuminen',  result:'Hylättiin',    yeas:88,  nays:112 },
  { vote_id:'v7', choice:'ei',   date:'2025-04-02', title:'HE 52/2024 — Turvapaikkakriteerien tiukentaminen',              topic:'maahanmuutto', result:'Hyväksyttiin', yeas:107, nays:93 },
  { vote_id:'v8', choice:'jaa',  date:'2025-03-28', title:'HE 3/2024 — Kansalaisaloitteen kynnyksen lasku',                topic:'demokratia',result:'Hylättiin',    yeas:79,  nays:121 },
]

export const MOCK_QUESTIONS = [
  { id:'v4', topic:'sosiaali',     date:'2025-04-09', title:'Työttömyysturvan leikkaukset',          description:'Ansiosidonnaisen työttömyysturvan kestoa lyhennetään ja karenssiaikaa pidennetään.', result:'Hyväksyttiin 104–96. Hallitus puolesta, oppositio vastaan.' },
  { id:'v2', topic:'talous',       date:'2025-04-14', title:'Puolustusmäärärahojen lisäys',           description:'Puolustusbudjettia nostetaan 2,3 miljardilla eurolla kolmen vuoden aikana.', result:'Hyväksyttiin 143–57. Vasemmisto ja vihreät äänestivät osittain vastaan.' },
  { id:'v3', topic:'koulutus',     date:'2025-04-11', title:'Varhaiskasvatusmaksujen alentaminen',    description:'Päivähoitomaksuja pienennetään pienituloisten perheiden osalta 30 prosentilla.', result:'Hyväksyttiin 167–33. Laaja tuki yli puoluerajojen.' },
  { id:'v5', topic:'ympäristö',    date:'2025-04-07', title:'Kaivoslain uudistus',                    description:'Kaivosyhtiöiden ympäristövastuuta ja lupamenettelyä tiukennetaan.', result:'Hylättiin 88–112. Oppositio kannatti, hallitus äänesti vastaan.' },
  { id:'v7', topic:'maahanmuutto', date:'2025-04-02', title:'Turvapaikkakriteerien tiukentaminen',    description:'Humanitaarisen suojelun myöntämistä rajoitetaan ja käsittelyaikoja lyhennetään.', result:'Hyväksyttiin 107–93. Selkeä jako hallitus–oppositio-linjalla.' },
  { id:'v1', topic:'sosiaali',     date:'2025-04-15', title:'Asiakasmaksujen korotus sote-palveluissa', description:'Terveyskeskusmaksuja ja erikoissairaanhoidon omavastuuosuuksia korotetaan.', result:'Hyväksyttiin 112–88. Oppositio äänesti yksimielisesti vastaan.' },
  { id:'v6', topic:'asuminen',     date:'2025-04-04', title:'Asumistuen uudistus',                    description:'Asumistuki sidotaan vahvemmin todellisiin markkinahintoihin.', result:'Hylättiin 88–112.' },
  { id:'v8', topic:'demokratia',   date:'2025-03-25', title:'Kansalaisaloitteen kynnyksen lasku',      description:'Kansalaisaloitteen vaatima allekirjoitusmäärä lasketaan 50 000:sta 25 000:een.', result:'Hylättiin 79–121. Hallituspuolueet äänestivät vastaan.' },
]

export const PARTY_META = {
  'kok':   { bg:'#E6F1FB', text:'#0C447C', short:'KOK',  label:'Kokoomus'         },
  'sd':    { bg:'#FCEBEB', text:'#791F1F', short:'SDP',  label:'SDP'              },
  'ps':    { bg:'#FEF3E2', text:'#633806', short:'PS',   label:'Perussuomalaiset' },
  'kesk':  { bg:'#EAF3DE', text:'#27500A', short:'KESK', label:'Keskusta'         },
  'vihr':  { bg:'#E1F5Eee', text:'#085041', short:'VIHR', label:'Vihreät'         },
  'vas':   { bg:'#FDECEA', text:'#7A1D1D', short:'VAS',  label:'Vasemmistoliitto' },
  'r':     { bg:'#E6F1FB', text:'#185FA5', short:'RKP',  label:'RKP'              },
  'kd':    { bg:'#EEEDFE', text:'#3C3489', short:'KD',   label:'KD'               },
  'saf':   { bg:'#F5F5F5', text:'#333333', short:'SAF',  label:'Suomen Asepalve.' },
  'liik':  { bg:'#FEF3E2', text:'#633806', short:'LIIK', label:'Liike Nyt'        },
  'tv':    { bg:'#F5F5F5', text:'#333333', short:'TV',   label:'Tosi Perussuom.'  },
}
