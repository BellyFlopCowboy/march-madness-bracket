import { useState, useMemo, useEffect, useCallback } from "react";

// ── SUPABASE CONFIG ───────────────────────────────────────────────────
const SB_URL = "https://fbsotnclyjqpyrcdoqsz.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic290bmNseWpxcHlyY2RvcXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTc1NjQsImV4cCI6MjA4OTMzMzU2NH0.hkEjKS1pBRDT-EZeGQDFKI3tIN69bjwRpM1iYRkts7k";
const SB_HEADERS = {"Content-Type":"application/json","apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`};
const CUTOFF = new Date("2026-03-19T17:00:00Z"); // 10 AM ET March 18

async function sbFetch(path, opts = {}) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: SB_HEADERS, ...opts });
    return r.ok ? r.json() : null;
  } catch { return null; }
}
const saveBracket = (name, picks, mode, champ) =>
  sbFetch("brackets", { method:"POST", headers:{...SB_HEADERS,"Prefer":"return=representation"},
    body: JSON.stringify({ name, picks, upset_mode: mode, champion: champ }) });
const loadBracket = (id) => sbFetch(`brackets?id=eq.${id}&select=*`);
const searchBrackets = (name) => sbFetch(`brackets?name=ilike.*${encodeURIComponent(name)}*&select=*&order=created_at.desc`);
const allBrackets = () => sbFetch("brackets?select=*&order=created_at.desc");
const getResults = async () => { const d = await sbFetch("results?id=eq.1"); return d?.[0]?.picks || {}; };
const saveResultsPicks = (picks) =>
  sbFetch("results?id=eq.1", { method:"PATCH", headers:{...SB_HEADERS,"Prefer":"return=representation"},
    body: JSON.stringify({ picks, updated_at: new Date().toISOString() }) });
const ADMIN_PW = "Patrick";

// ── SCORING ───────────────────────────────────────────────────────────
const ROUND_PTS = { pi:0, r64:1, r32:2, s16:4, e8:8, ff:16, champ:32 };
function calcScore(userPicks, results) {
  let score=0, possible=0, correct=0, total=0;
  for (const [gid, pick] of Object.entries(userPicks)) {
    const prefix = gid === "champ" ? "champ" : gid.split("_")[0];
    const pts = ROUND_PTS[prefix] || 0;
    if (pts === 0) continue;
    total++;
    possible += pts;
    if (results[gid]) { if (results[gid] === pick) { score += pts; correct++; } }
    else { possible += 0; } // game not played yet
  }
  return { score, possible, correct, total };
}

// ── NAME HANDLING ─────────────────────────────────────────────────────
const BLOCKLIST = ["ass","shit","fuck","damn","dick","cock","cunt","bitch","piss","slut","whore","tits","fag","nig","porn","nazi","rape","anal","cum","hoe","thot","stfu","wtf","milf"];
function sanitizeName(raw) { return raw.replace(/[^a-zA-Z\s]/g,"").replace(/\s+/g," ").slice(0,20); }
function isClean(name) { const lower=name.toLowerCase().replace(/\s/g,""); return !BLOCKLIST.some(w=>lower.includes(w)); }
function truncateName(name) {
  const parts=name.trim().split(/\s+/);
  if(parts.length<2) return parts[0]?.slice(0,3)||"???";
  const first=parts[0].slice(0,3);
  const lastInit=parts[parts.length-1][0]?.toUpperCase()||"";
  return `${first} ${lastInit}.`;
}


const T = (name,seed,region,rec,kp,off,def,star,inj,style,str,weak,mom,march) =>
  ({name,seed,region,rec,kp,off,def,star,inj,style,str,weak,mom,march});

const TEAMS = {
  duke:T("Duke",1,"east","30-2",1,4,2,"Cameron Boozer 17.2 PPG","Caleb Foster OUT (foot surgery); Ngongba DTD (foot)","Elite two-way","Best two-way efficiency in country","No starting PG; thinner without Foster",9,9),
  siena:T("Siena",16,"east","20-13",192,208,175,null,null,"Mid-major","Won MAAC tournament","Massive talent gap",6,2),
  ohiost:T("Ohio State",8,"east","24-8",26,17,53,"Bruce Thornton 21.8 PPG (last 4)","Chatman DTD (groin)","Streaky offense","Hot shooting late-season","Inconsistent defense",8,5),
  tcu:T("TCU",9,"east","22-11",43,81,22,null,null,"Defense-first","Elite defense #22","Offense ranks #81",6,5),
  stjohns:T("St. John's",5,"east","27-6",16,44,12,"RJ Luis / Zuby Ejiofor",null,"Defense-first","Big East champs; #12 defense","Half-court offense can stall",9,7),
  niowa:T("Northern Iowa",12,"east","23-12",71,153,24,null,null,"Defense-first","Elite defense #24; won MVC as 7-seed","Offense severely limited #153",8,4),
  kansas:T("Kansas",4,"east","23-9",21,57,10,"Flory Bidunga","Darryn Peterson inconsistent (health/role all season)","Defense-first","#10 defense; 8 Quad 1 wins; Bill Self","Offense struggles #57; 47 pts in Big 12 loss",5,9),
  calbap:T("Cal Baptist",13,"east","25-8",106,191,49,null,null,"Guard-heavy","First tournament ever; backcourt combo","First tourney appearance; step up in class",7,1),
  louis:T("Louisville",6,"east","24-8",19,20,25,"Ryan Conwell / Isaac McKneely","Jalen Brown DTD (back — hasn't played since Feb 28)","Balanced","Solid #20/#25 both ways","Brown's absence caps ceiling",6,7),
  usf:T("South Florida",11,"east","24-9",49,58,48,null,null,"Physical defense","Tough, physical, well-coached","Limited star power",7,3),
  michst:T("Michigan State",3,"east","26-6",9,24,13,"Jeremy Fears Jr. 20+ last 4 games",null,"Balanced","Izzo in March; Fears on a tear","Can go cold from 3",9,10),
  ndsu:T("North Dakota State",14,"east","24-10",113,124,123,null,null,"Mid-major balanced","Summit League champs","Not enough firepower",6,2),
  ucla:T("UCLA",7,"east","22-10",27,22,54,"Tyler Bilodeau","Bilodeau DTD (knee strain — missed Big Ten semis)","Offense-first","Strong offense #22","Bilodeau injury; defense #54",5,6),
  ucf:T("UCF",10,"east","23-10",54,40,101,"Themus Fulks / Jamichael Stillwell",null,"Athletic offense","Good offense #40; length","Defense #101 is a liability",7,3),
  uconn:T("UConn",2,"east","27-5",12,30,11,"Alex Karaban / Liam McNeely",null,"Defense-first","Tournament DNA; #11 defense","Offense #30 can stall",7,10),
  furman:T("Furman",15,"east","22-12",190,200,182,null,null,"Mid-major","Won SoCon tournament","Outmatched at this level",6,3),
  arizona:T("Arizona",1,"west","30-3",3,5,3,"Koa Peat (likely #1 pick)",null,"Elite two-way","Top-5 off & top-3 def; Big 12 champs","Lloyd 1-3 in NCAA tourneys",9,6),
  liu:T("LIU",16,"west","18-15",216,239,186,null,null,"Mid-major","NEC champ","Severe talent gap",5,1),
  nova:T("Villanova",8,"west","22-10",33,41,35,null,"Matt Hodge OUT (season-ending ACL)","Balanced","8 straight R64 wins","Lost Hodge; thin; no tourney since 2022",5,7),
  utahst:T("Utah State",9,"west","27-6",30,28,44,"MJ Collins / Mason Falslev",null,"Guard-driven","KenPom higher than Villanova; elite guards","Defense #44 can leak",8,4),
  wiscy:T("Wisconsin",5,"west","24-8",22,11,51,"Kamari McGlynn / John Blackwell",null,"Offense-first","#11 offense; scorching hot late","Defense #51 below average",9,7),
  highpt:T("High Point",12,"west","27-6",92,66,161,null,null,"Offensive rebounding","Creates extra possessions","Defense #161; step up in class",7,2),
  arkansas:T("Arkansas",4,"west","24-9",18,6,52,"Darius Acuff Jr. (Kemba-esque freshman)",null,"Up-tempo offense","SEC champs; #6 offense; Calipari","Defense #52; can get outscored",10,9),
  hawaii:T("Hawaii",13,"west","24-8",107,207,42,null,null,"Defense-first","Big West champs","Haven't played a ranked opponent",7,1),
  byu:T("BYU",6,"west","23-9",23,10,57,"AJ Dybantsa (nation's leading scorer)","Richie Saunders OUT (season-ending ACL)","Star-driven","Dybantsa is electric; #10 offense","Under .500 since losing Saunders",6,4),
  texas:T("Texas",11,"west","20-13",37,13,111,"Dailyn Swain",null,"Offense-first","Elite offense #13; size; Sean Miller","Defense #111 is terrible",5,7),
  ncstate:T("NC State",11,"west","19-14",34,19,86,null,null,"Three-point shooting","10th nationally in 3PT accuracy","2-7 in last 9; fading badly",3,6),
  gonzaga:T("Gonzaga",3,"west","30-3",10,29,9,"Graham Ike 19.7 PPG","Braden Huff OUT (knee — may return 2nd weekend)","Interior-dominant","Ike is dominant; #9 defense; WCC champs","Without Huff, ceiling is capped",7,9),
  kennesaw:T("Kennesaw State",14,"west","22-12",163,144,195,null,null,"Mid-major","ASUN champ","Overmatched",6,1),
  miamifl:T("Miami (FL)",7,"west","25-8",31,33,38,null,null,"Balanced","Balanced; first year under Lucas; 13-7 ACC","No dominant star",7,3),
  missouri:T("Missouri",10,"west","20-12",52,50,77,null,null,"Balanced","Third tourney in 4 years","Below-avg defense; no star",6,5),
  purdue:T("Purdue",2,"west","28-5",8,2,36,"Braden Smith 9.0 APG",null,"Elite offense","#2 offense; Smith near all-time assist record","Defense #36 is a vulnerability",9,8),
  queens:T("Queens",15,"west","24-9",181,77,322,null,null,"Offense-only","First ever tourney","Defense #322; first tourney ever",6,1),
  michigan:T("Michigan",1,"midwest","29-4",2,8,1,"Yaxel Lendeborg / Aday Mara 7'2\"",null,"Defense-first","#1 defense; massive frontcourt; 5-0 vs ranked","Can go cold from perimeter",9,5),
  umbc:T("UMBC",16,"midwest","21-13",185,184,193,null,null,"Mid-major","AE champ","Massive talent gap",5,3),
  howard:T("Howard",16,"midwest","19-14",207,283,118,null,null,"Defense-first","MEAC champ","Can't score (#283)",5,1),
  georgia:T("Georgia",8,"midwest","21-11",32,16,80,null,null,"Offense-first","Elite offense #16","Defense #80; first-year coach",6,2),
  stlouis:T("Saint Louis",9,"midwest","24-9",41,51,41,null,null,"Balanced","A-10 reg season champs","Lack a go-to scorer",7,4),
  ttech:T("Texas Tech",5,"midwest","22-10",20,12,33,"Christian Anderson","JT Toppin OUT (season-ending ACL); LeJuan Watts GTD","Offense-first now","#12 offense; McCasland is sharp","Lost Toppin; now jump-shot dependent",5,6),
  akron:T("Akron",12,"midwest","29-4",64,54,113,"Shammah Scott / Tavari Johnson",null,"Three-point shooting","3 straight MAC titles; school record 29 W","Defense #113; step up in class",8,5),
  alabama:T("Alabama",4,"midwest","23-9",17,3,67,"Labaron Philon Jr.","Aden Holloway SUSPENDED (felony arrest — OFF TEAM)","Explosive offense","#3 offense; Philon is elite","Lost Holloway (16.8 PPG); 9 scholarship players",4,7),
  hofstra:T("Hofstra",13,"midwest","24-10",88,89,96,null,null,"Balanced mid-major","CAA tourney champs","No standout star",7,2),
  tenn:T("Tennessee",6,"midwest","23-9",15,37,15,"Nate Ament / Ja'Kobi Gillespie",null,"Defense-first","#15 defense; Ament likely lottery pick","Offense #37 can stall",7,7),
  smu:T("SMU",11,"midwest","20-13",42,26,91,"Jaron Pierre","B.J. Edwards DTD (ankle)","Offense-first","Elite offense #26","Defense #91; last 4 in",5,3),
  miamioh:T("Miami (OH)",11,"midwest","27-5",93,70,156,"Eian Elmer",null,"Balanced mid-major","Undefeated MAC reg season","KenPom 93; defense #156",7,1),
  virginia:T("Virginia",3,"midwest","26-6",13,27,16,"Malik Thomas / Thijs de Ridder",null,"Pace-control defense","Trademark defense #16; deep","Methodical pace can backfire",8,9),
  wrightst:T("Wright State",14,"midwest","18-11",140,117,194,null,null,"Young mid-major","Horizon League champ","Very young; defense #194",6,1),
  kentucky:T("Kentucky",7,"midwest","22-10",28,39,27,null,"Jayden Quaintance barely available (knee)",null,"Defensive improvement late","No reliable second scorer",6,6),
  stclara:T("Santa Clara",10,"midwest","26-6",35,23,82,null,null,"Offense-first","Elite offense #23","Defense #82; mid-major schedule",7,3),
  iowast:T("Iowa State",2,"midwest","27-5",6,21,4,"Joshua Jefferson 16.9/7.6/4.9",null,"Elite defense","#4 defense; Jefferson best big; won at Purdue by 23","Offense #21 good not great",9,8),
  tennst:T("Tennessee State",15,"midwest","19-14",187,173,212,null,null,"Mid-major","OVC champ","Overmatched",5,1),
  florida:T("Florida",1,"south","28-5",4,9,6,"Condon / Haugh / Chinyelu",null,"Frontcourt-dominant","Defending champs; best rebounding team","3PT shooting 324th (30.8%)",8,10),
  pvam:T("Prairie View A&M",16,"south","18-15",288,310,231,null,null,"Mid-major","SWAC champ","Overmatched",5,1),
  lehigh:T("Lehigh",16,"south","22-12",284,290,257,null,null,"Mid-major","Patriot League champ","Overmatched",6,2),
  clemson:T("Clemson",8,"south","21-12",36,71,20,null,"Carter Welling OUT (ACL in ACC tourney)","Defense-first","Elite defense #20","Lost 6'11\" starter; offense #71",4,5),
  iowa:T("Iowa",9,"south","22-11",25,31,31,"Bennett Stirtz 20.0 PPG",null,"Balanced","Best scoring D in Big Ten (66 PPG)","No elite ceiling",7,5),
  vandy:T("Vanderbilt",5,"south","25-8",11,7,29,"Tyler Tanner / Duke Miles",null,"Up-tempo","#7 offense; beat Florida by 17 in SEC tourney","Defense #29 can leak; under-seeded",9,5),
  mcneese:T("McNeese",12,"south","28-5",68,91,47,null,null,"Athletic defense","Southland champs; solid defense #47","Haven't faced this level",7,2),
  nebraska:T("Nebraska",4,"south","28-6",14,55,7,"Pryce Sandfort 17.9 PPG (40% 3PT)",null,"Defense-first","#7 defense; best in Big Ten","Never won an NCAA tourney game; offense #55",7,3),
  troy:T("Troy",13,"south","25-8",143,141,166,null,null,"Mid-major","Sun Belt champ; beat SDSU on road","Limited athleticism",7,3),
  unc:T("North Carolina",6,"south","23-9",29,32,37,"Seth Trimble / Henri Veesaar","Caleb Wilson OUT (season-ending broken thumb)","Diminished","Beat Duke; Trimble is elite defender","0-2 without Wilson; star freshman gone",3,8),
  vcu:T("VCU",11,"south","26-7",46,46,63,null,null,"Pressure defense","A-10 champs; 16-1 in last 17; shoot 3s well","Ceiling question in later rounds",9,3),
  illinois:T("Illinois",3,"south","26-6",7,1,28,"Keaton Wagler 40.2% 3PT, 4.4 APG",null,"Elite offense","#1 offense in nation; Wagler is gem","Defense #28 good not great",8,6),
  penn:T("Penn",14,"south","22-8",159,215,112,null,null,"Ivy League","Ivy champ; solid defense","Offense #215 can't keep up",6,2),
  stmarys:T("Saint Mary's",7,"south","27-5",24,43,19,null,null,"Pace-control defense","#19 defense; WCC pace-control","Offense #43 can stall",7,7),
  texam:T("Texas A&M",10,"south","21-11",39,49,40,null,null,"Experienced","#8 most experienced per KenPom","First-year coach; few wins vs tourney teams",6,3),
  houston:T("Houston",2,"south","27-5",5,14,5,"Kingston Flemings / Milos Uzan",null,"Elite defense","#5 defense; title game last year; Houston site","Offense #14 can go cold",8,10),
  idaho:T("Idaho",15,"south","22-11",145,176,136,null,null,"Mid-major","Big Sky champ","Overmatched",6,1),
};

// ── BRACKET STRUCTURE ─────────────────────────────────────────────────
const PLAY_IN=[{id:"pi1",t1:"texas",t2:"ncstate",label:"West"},{id:"pi2",t1:"umbc",t2:"howard",label:"Midwest"},{id:"pi3",t1:"pvam",t2:"lehigh",label:"South"},{id:"pi4",t1:"smu",t2:"miamioh",label:"Midwest"}];
const R64={
  east:[["duke","siena"],["ohiost","tcu"],["stjohns","niowa"],["kansas","calbap"],["louis","usf"],["michst","ndsu"],["ucla","ucf"],["uconn","furman"]],
  west:[["arizona","liu"],["nova","utahst"],["wiscy","highpt"],["arkansas","hawaii"],["byu","pi:pi1"],["gonzaga","kennesaw"],["miamifl","missouri"],["purdue","queens"]],
  midwest:[["michigan","pi:pi2"],["georgia","stlouis"],["ttech","akron"],["alabama","hofstra"],["tenn","pi:pi4"],["virginia","wrightst"],["kentucky","stclara"],["iowast","tennst"]],
  south:[["florida","pi:pi3"],["clemson","iowa"],["vandy","mcneese"],["nebraska","troy"],["unc","vcu"],["illinois","penn"],["stmarys","texam"],["houston","idaho"]],
};
const R32_PAIRS=[[0,1],[2,3],[4,5],[6,7]];
const S16_PAIRS=[[0,1],[2,3]];
const FF_PAIRS=[["east","south"],["midwest","west"]];

// ── ANALYSIS NOTES ────────────────────────────────────────────────────
const PI_NOTES={pi1:{rec:"texas",conf:"medium",note:"Texas has better size and Sean Miller's coaching edge. NC State is 2-7 in their last 9."},pi2:{rec:"umbc",conf:"low",note:"True toss-up. UMBC (KenPom 185) is more balanced than Howard (207)."},pi3:{rec:"lehigh",conf:"low",note:"Slight edge to Lehigh with a better overall profile."},pi4:{rec:"smu",conf:"medium",note:"Biggest gap in the First Four. SMU is KenPom 42 with elite offense (#26). Miami (OH) is KenPom 93."}};
const R64_NOTES={east:[{rec:"duke",conf:"high",note:"Even without Foster, Duke's talent gap is enormous. Siena (KenPom 192) has no path."},{rec:"ohiost",conf:"medium",note:"Toss-up, but Ohio State's late surge tips it. Thornton averaging 21.8 PPG since Feb 26."},{rec:"stjohns",conf:"high",note:"Big East champs' #12 defense smothers UNI's #153 offense. UNI fatigued from 4 games in 4 nights."},{rec:"kansas",conf:"high",note:"Cal Baptist's first-ever tourney vs Bill Self's experience. Bidunga's rim protection too much."},{rec:"louis",conf:"medium",note:"Hinges on Jalen Brown's back. Even without him, Conwell and McKneely can score enough."},{rec:"michst",conf:"high",note:"Izzo in March. Fears scored 20+ in four straight. NDSU can't match MSU's athleticism."},{rec:"ucf",conf:"medium",note:"\u{1F525} UPSET WATCH. Bilodeau's knee limits UCLA. UCF's Fulks and Stillwell exploit it."},{rec:"uconn",conf:"high",note:"UConn's defense (#11) and tournament DNA overwhelm Furman (KenPom 190)."}],west:[{rec:"arizona",conf:"high",note:"Massive mismatch. Arizona's #5 offense and #3 defense vs KenPom 216."},{rec:"utahst",conf:"medium",note:"\u{1F525} UPSET WATCH. Villanova lost Hodge (ACL). Utah St (KenPom 30) outranks Nova (33)."},{rec:"wiscy",conf:"medium",note:"High Point creates extra possessions but Wisconsin's #11 offense is too much."},{rec:"arkansas",conf:"high",note:"Calipari's SEC champs rolling. Acuff is Kemba-esque. Hawaii hasn't played a ranked team."},{rec:"byu",conf:"medium",note:"Dybantsa is the best player on the floor. Even without Saunders, firepower carries BYU."},{rec:"gonzaga",conf:"high",note:"Even without Huff, Graham Ike (19.7 PPG) is dominant. Kennesaw (KenPom 163) overmatched."},{rec:"miamifl",conf:"medium",note:"Miami 25-8 with balanced profile (KenPom 31). ACC experience beats Missouri (KenPom 52)."},{rec:"purdue",conf:"high",note:"Smith 2 assists from Hurley's all-time record. Purdue's #2 offense vs Queens' #322 defense."}],midwest:[{rec:"michigan",conf:"high",note:"Michigan's #1 defense and KenPom #2 overall. Massive frontcourt dominates."},{rec:"georgia",conf:"medium",note:"Georgia's #16 offense outscores disciplined Saint Louis. Bad defense (#80) keeps it close."},{rec:"ttech",conf:"medium",note:"Without Toppin, TTech is jump-shot dependent. But Anderson and McCasland survive vs Akron."},{rec:"alabama",conf:"medium",note:"Even without Holloway, Philon is elite and Bama's #3 offense has weapons. Talent gap holds."},{rec:"tenn",conf:"medium",note:"Tennessee's #15 defense is a nightmare. Gillespie and Ament grind out the play-in winner."},{rec:"virginia",conf:"high",note:"Virginia's #16 defense smothers Wright State's young roster."},{rec:"kentucky",conf:"medium",note:"KenPom coin-flip (28 vs 35) but Kentucky's size and Pope's prep give them the edge."},{rec:"iowast",conf:"high",note:"Iowa State's #4 defense. Jefferson (16.9/7.6/4.9) is the most complete big in the tourney."}],south:[{rec:"florida",conf:"high",note:"Defending champs' frontcourt (Condon, Haugh, Chinyelu) is a matchup nightmare."},{rec:"iowa",conf:"medium",note:"\u{1F525} UPSET WATCH. Clemson lost Welling (ACL). Iowa's Stirtz averages 20 PPG."},{rec:"vandy",conf:"medium",note:"Vanderbilt's #7 offense is elite. Tanner and Miles lead steal-happy backcourt."},{rec:"nebraska",conf:"medium",note:"Nebraska's never won a tourney game — this is the year. Sandfort (17.9 PPG, 40% 3PT) leads."},{rec:"vcu",conf:"medium",note:"\u{1F525} UPSET WATCH. UNC is 0-2 without Wilson. VCU 16-1 in last 17. Only 3-pt spread."},{rec:"illinois",conf:"high",note:"Illinois has #1 offense. Wagler's 40.2% from 3 drives a machine Penn can't slow."},{rec:"stmarys",conf:"medium",note:"Saint Mary's defense (#19) grinds opponents by controlling pace."},{rec:"houston",conf:"high",note:"Houston's #5 defense overwhelms Idaho (KenPom 145). On a mission after last year's loss."}]};

const UPSET_MODES=[
  {id:"chalk",label:"By the Books",emoji:"\u{1F4DA}",desc:"Trust the seeds. Higher-ranked teams win.",injW:0.5,momW:0.3,seedB:2},
  {id:"calculated",label:"Calculated Risks",emoji:"\u{1F3AF}",desc:"Data-backed upsets only. Injuries and matchups matter.",injW:1.5,momW:0.8,seedB:0.5},
  {id:"chaos",label:"Cinderella Season",emoji:"\u{1F460}",desc:"Lean into momentum and injury advantages.",injW:2.5,momW:1.5,seedB:-0.5},
  {id:"madness",label:"Bracket Arsonist",emoji:"\u{1F525}",desc:"Maximum chaos. Underdogs with any edge get the nod.",injW:3,momW:2.5,seedB:-1.5},
];

function generateAnalysis(t1k,t2k,mode){
  const a=TEAMS[t1k],b=TEAMS[t2k]; if(!a||!b) return {rec:t1k,conf:"low",note:"N/A"};
  const m=UPSET_MODES.find(x=>x.id===mode)||UPSET_MODES[1];
  let aS=0,bS=0,reasons=[];
  if(a.seed<b.seed)aS+=m.seedB;else if(b.seed<a.seed)bS+=m.seedB;
  const kd=b.kp-a.kp;if(Math.abs(kd)>20){if(kd>0){aS+=2.5;reasons.push(`${a.name} KenPom edge (#${a.kp} vs #${b.kp})`);}else{bS+=2.5;reasons.push(`${b.name} KenPom edge (#${b.kp} vs #${a.kp})`);}}else if(Math.abs(kd)>8){if(kd>0)aS+=1;else bS+=1;}
  if((b.def-a.off)>30){aS+=2;reasons.push(`${a.name}'s offense (#${a.off}) exploits ${b.name}'s defense (#${b.def})`);}else if((b.def-a.off)>15)aS+=1;
  if((a.def-b.off)>30){bS+=2;reasons.push(`${b.name}'s offense (#${b.off}) exploits ${a.name}'s defense (#${a.def})`);}else if((a.def-b.off)>15)bS+=1;
  const md=a.march-b.march;if(md>=3){aS+=1.5;reasons.push(`${a.name} has coaching/March advantage`);}else if(md>=1)aS+=0.5;if(md<=-3){bS+=1.5;reasons.push(`${b.name} has coaching/March advantage`);}else if(md<=-1)bS+=0.5;
  const momd=a.mom-b.mom;if(momd>=3){aS+=m.momW*1.5;reasons.push(`${a.name} better momentum (${a.mom}/10 vs ${b.mom}/10)`);}else if(momd>=1)aS+=m.momW*0.5;if(momd<=-3){bS+=m.momW*1.5;reasons.push(`${b.name} better momentum (${b.mom}/10 vs ${a.mom}/10)`);}else if(momd<=-1)bS+=m.momW*0.5;
  const injP=inj=>{if(!inj)return 0;if(inj.includes("OUT")||inj.includes("SUSPENDED"))return m.injW*1.5;if(inj.includes("DTD")||inj.includes("GTD"))return m.injW*0.8;return 0;};
  if(injP(a.inj)>0){bS+=injP(a.inj);reasons.push(`${a.name}: ${a.inj.split(";")[0].trim()}`);}
  if(injP(b.inj)>0){aS+=injP(b.inj);reasons.push(`${b.name}: ${b.inj.split(";")[0].trim()}`);}
  const w=aS>=bS?t1k:t2k,margin=Math.abs(aS-bS);
  return{rec:w,conf:margin>4?"high":margin>1.5?"medium":"low",note:reasons.slice(0,3).join(". ")+"."};
}
function adjustR64(note,mode){
  if(mode==="chalk"&&note.note.includes("UPSET"))return{...note,conf:"low",note:note.note.replace("\u{1F525} UPSET WATCH.","⚠️ Upset possible:")};
  if(mode==="madness"&&note.note.includes("UPSET"))return{...note,conf:"high",note:note.note.replace("\u{1F525} UPSET WATCH.","\u{1F525} PULL THE TRIGGER.")};
  return note;
}

// ── UI CONSTANTS ──────────────────────────────────────────────────────
const ROUND_NAMES=["First Four","Round of 64","Round of 32","Sweet 16","Elite Eight","Final Four","Championship"];
const RLABELS={east:"East",west:"West",midwest:"Midwest",south:"South"};
const RCOLORS={east:"#3b82f6",west:"#f97316",midwest:"#a855f7",south:"#10b981"};
const RORDER=["east","west","midwest","south"];
const C={bg:"#0a0e1a",card:"#111827",accent:"#f59e0b",green:"#22c55e",red:"#ef4444",text:"#f1f5f9",dim:"#94a3b8",sub:"#7d8ca1",border:"#1e293b",surface:"#0f172a"};

// ── GAME CARD COMPONENT ──────────────────────────────────────────────
function GameCard({game,picked,onPick,mode}){
  const t1=TEAMS[game.t1],t2=TEAMS[game.t2]; if(!t1||!t2)return null;
  const anal=game.analysis,hasInj=t1.inj||t2.inj;
  const isUpset=anal?.note?.includes("UPSET")||anal?.note?.includes("TRIGGER");
  return(
    <div style={{background:C.card,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
      {[game.t1,game.t2].map((tk,idx)=>{const tm=TEAMS[tk],isRec=anal?.rec===tk,isP=picked===tk,isL=picked&&picked!==tk;
        return(<button key={tk} onClick={()=>onPick?.(game.id,tk)} style={{display:"flex",alignItems:"center",padding:"12px 14px",gap:10,width:"100%",background:isP?`${C.green}0d`:isL?C.surface:"transparent",border:"none",borderBottom:idx===0?`1px solid ${C.border}`:"none",cursor:onPick?"pointer":"default",opacity:isL?0.35:1,transition:"all 0.15s"}}>
          <span style={{fontSize:17,fontWeight:800,color:C.accent,width:24,textAlign:"center",flexShrink:0}}>{tm.seed}</span>
          <div style={{flex:1,textAlign:"left",minWidth:0}}>
            <div style={{fontSize:16,fontWeight:isP?800:600,color:isP?C.green:C.text,display:"flex",alignItems:"center",gap:4}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tm.name}</span>{isP&&<span style={{fontSize:13,flexShrink:0}}>✓</span>}</div>
            <div style={{fontSize:12,color:C.sub,marginTop:2}}>{tm.rec} · KP #{tm.kp} · Off #{tm.off} · Def #{tm.def}</div>
          </div>
          <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
            {tm.inj&&<span style={{fontSize:12,color:C.red}}>⚕</span>}
            {isRec&&<span style={{fontSize:11,background:`${C.accent}1a`,color:C.accent,padding:"3px 8px",borderRadius:4,fontWeight:700,lineHeight:1,whiteSpace:"nowrap"}}>{anal.conf==="high"?"AI Pick ★★★":anal.conf==="medium"?"AI Pick ★★":"AI Pick ★"}</span>}
          </div>
        </button>);
      })}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,background:C.surface}}>
        {isUpset&&<div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:4,letterSpacing:1}}>UPSET ALERT</div>}
        <div style={{fontSize:13,color:C.dim,lineHeight:1.55}}><span style={{color:C.accent,fontWeight:700}}>AI Pick: </span><span style={{color:C.text,fontWeight:600}}>{TEAMS[anal?.rec]?.name||"—"}</span><span style={{color:C.sub}}> — </span>{anal?.note}</div>
        {hasInj&&<div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.border}`}}>{t1.inj&&<div style={{fontSize:12,color:C.red,lineHeight:1.4}}>⚕ {t1.name}: {t1.inj}</div>}{t2.inj&&<div style={{fontSize:12,color:C.red,lineHeight:1.4}}>⚕ {t2.name}: {t2.inj}</div>}</div>}
      </div>
    </div>
  );
}

// ── VISUAL BRACKET ───────────────────────────────────────────────────
function getEliminatedTeams(results) {
  const eliminated = new Set();
  const resolvePI = (k) => { if(typeof k==="string"&&k.startsWith("pi:")) return results[k.slice(3)]||null; return k; };
  // Play-ins
  for(const pi of PLAY_IN){ if(results[pi.id]){ const loser=results[pi.id]===pi.t1?pi.t2:pi.t1; eliminated.add(loser); }}
  // R64
  for(const reg of RORDER) R64[reg].forEach((pair,i)=>{
    const gid=`r64_${reg}_${i}`; if(!results[gid]) return;
    const t1=resolvePI(pair[0]),t2=resolvePI(pair[1]); if(!t1||!t2) return;
    eliminated.add(results[gid]===t1?t2:t1);
  });
  // R32
  for(const reg of RORDER) R32_PAIRS.forEach(([a,b],i)=>{
    const gid=`r32_${reg}_${i}`; if(!results[gid]) return;
    const t1=results[`r64_${reg}_${a}`],t2=results[`r64_${reg}_${b}`]; if(!t1||!t2) return;
    eliminated.add(results[gid]===t1?t2:t1);
  });
  // S16
  for(const reg of RORDER) S16_PAIRS.forEach(([a,b],i)=>{
    const gid=`s16_${reg}_${i}`; if(!results[gid]) return;
    const t1=results[`r32_${reg}_${a}`],t2=results[`r32_${reg}_${b}`]; if(!t1||!t2) return;
    eliminated.add(results[gid]===t1?t2:t1);
  });
  // E8
  for(const reg of RORDER){
    const gid=`e8_${reg}`; if(!results[gid]) continue;
    const t1=results[`s16_${reg}_0`],t2=results[`s16_${reg}_1`]; if(!t1||!t2) continue;
    eliminated.add(results[gid]===t1?t2:t1);
  }
  // FF
  FF_PAIRS.forEach(([r1,r2],i)=>{
    const gid=`ff_${i}`; if(!results[gid]) return;
    const t1=results[`e8_${r1}`],t2=results[`e8_${r2}`]; if(!t1||!t2) return;
    eliminated.add(results[gid]===t1?t2:t1);
  });
  // Champ
  if(results.champ){ const t1=results.ff_0,t2=results.ff_1; if(t1&&t2) eliminated.add(results.champ===t1?t2:t1); }
  return eliminated;
}

function getSlotStatus(gid, userPick, results, eliminated) {
  if(!userPick) return "pending";
  if(results[gid]){ return results[gid]===userPick ? "correct" : "wrong"; }
  if(eliminated.has(userPick)) return "eliminated";
  return "pending";
}

const STATUS_STYLES = {
  correct: { bg: `#22c55e18`, border: "#22c55e", textColor: "#22c55e" },
  wrong: { bg: `#ef444418`, border: "#ef4444", textColor: "#ef4444" },
  eliminated: { bg: `#ef444410`, border: "#ef444466", textColor: "#ef444499" },
  pending: { bg: C.card, border: C.border, textColor: C.text },
};

function BracketSlot({teamKey,status="pending"}){
  const tm=TEAMS[teamKey]; if(!tm) return <div style={{...slotStyle,opacity:0.3}}>TBD</div>;
  const st=STATUS_STYLES[status]||STATUS_STYLES.pending;
  const icon = status==="correct"?" ✓":status==="wrong"||status==="eliminated"?" ✗":"";
  return(<div style={{...slotStyle,background:st.bg,borderColor:st.border}}>
    <span style={{color:C.accent,fontWeight:800,fontSize:12,width:18,flexShrink:0}}>{tm.seed}</span>
    <span style={{fontSize:12,fontWeight:600,color:st.textColor,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tm.name}{icon}</span>
  </div>);
}
const slotStyle={display:"flex",alignItems:"center",gap:4,padding:"4px 8px",border:`1px solid ${C.border}`,borderRadius:4,background:C.card,minWidth:110,maxWidth:140};

function RegionTree({region,picks,results}){
  const eliminated = results ? getEliminatedTeams(results) : new Set();
  const rounds=[
    {label:"R64",ids:Array.from({length:8},(_,i)=>`r64_${region}_${i}`)},
    {label:"R32",ids:Array.from({length:4},(_,i)=>`r32_${region}_${i}`)},
    {label:"S16",ids:Array.from({length:2},(_,i)=>`s16_${region}_${i}`)},
    {label:"E8",ids:[`e8_${region}`]},
  ];
  return(
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <div style={{width:4,height:20,borderRadius:2,background:RCOLORS[region]}}/>
        <span style={{fontSize:15,fontWeight:800,color:RCOLORS[region],letterSpacing:1}}>{RLABELS[region].toUpperCase()}</span>
      </div>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{display:"flex",gap:8,minWidth:560,paddingBottom:8}}>
          {rounds.map((rnd,ri)=>(
            <div key={ri} style={{display:"flex",flexDirection:"column",justifyContent:"space-around",flex:1,gap:ri===0?4:undefined}}>
              <div style={{fontSize:10,color:C.sub,fontWeight:700,marginBottom:4,textAlign:"center"}}>{rnd.label}</div>
              {rnd.ids.map(gid=>{
                const status = results ? getSlotStatus(gid, picks[gid], results, eliminated) : "pending";
                return <BracketSlot key={gid} teamKey={picks[gid]} status={status}/>;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualBracket({picks,results}){
  const champ=picks.champ?TEAMS[picks.champ]:null;
  const eliminated = results ? getEliminatedTeams(results) : new Set();
  const champStatus=champ&&results?getSlotStatus("champ",picks.champ,results,eliminated):"pending";
  const champSt=STATUS_STYLES[champStatus]||STATUS_STYLES.pending;
  const champBorderColor=champStatus==="correct"?C.green:champStatus==="wrong"||champStatus==="eliminated"?C.red:C.accent;
  const champBgColor=champStatus==="correct"?`${C.green}15`:champStatus==="wrong"||champStatus==="eliminated"?`${C.red}15`:`${C.accent}15`;
  const champLabelColor=champStatus==="correct"?C.green:champStatus==="wrong"||champStatus==="eliminated"?C.red:C.accent;
  return(
    <div style={{padding:8}}>
      {RORDER.map(r=><RegionTree key={r} region={r} picks={picks} results={results}/>)}
      <div style={{textAlign:"center",marginTop:12,padding:16,background:C.card,borderRadius:10,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,color:C.sub,fontWeight:700,letterSpacing:1,marginBottom:8}}>FINAL FOUR</div>
        <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
          {[0,1].map(i=>{
            const gid=`ff_${i}`,tk=picks[gid];
            const status=results?getSlotStatus(gid,tk,results,eliminated):"pending";
            return <BracketSlot key={i} teamKey={tk} status={status}/>;
          })}
        </div>
        {champ&&(
          <div style={{marginTop:8,padding:"12px 20px",background:champBgColor,borderRadius:8,border:`2px solid ${champBorderColor}`,display:"inline-block"}}>
            <div style={{fontSize:10,color:champLabelColor,fontWeight:700,letterSpacing:2}}>CHAMPION</div>
            <div style={{fontSize:24,fontWeight:900,color:champSt.textColor}}>🏀 {champ.name}</div>
            <div style={{fontSize:12,color:C.sub}}>{champ.rec} · KenPom #{champ.kp} · {champ.seed}-seed</div>
            {picks.tiebreaker&&(
              <div style={{fontSize:12,color:C.dim,marginTop:6}}>
                Predicted final: {TEAMS[picks.tiebreaker.team1]?.name} {picks.tiebreaker.score1} — {TEAMS[picks.tiebreaker.team2]?.name} {picks.tiebreaker.score2}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── LEADERBOARD ──────────────────────────────────────────────────────
function Leaderboard({brackets,results,myId,onView}){
  const scored=brackets.map(b=>{const s=calcScore(b.picks||{},results);return{...b,...s};}).sort((a,b)=>b.score-a.score);
  const top50=scored.slice(0,50);
  return(
    <div style={{padding:"0 8px"}}>
      <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:4}}>Leaderboard</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:12}}>Scoring: 1/2/4/8/16/32 per round · 192 max · Tap a name to view their bracket</div>
      {top50.length===0&&<div style={{color:C.sub,fontSize:14,padding:20,textAlign:"center"}}>No brackets submitted yet.</div>}
      {top50.map((b,i)=>(
        <button key={b.id} onClick={()=>onView?.(b)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:b.id===myId?`${C.accent}12`:i%2===0?C.card:C.surface,borderRadius:6,marginBottom:4,border:b.id===myId?`1px solid ${C.accent}`:`1px solid ${C.border}`,cursor:"pointer",transition:"all 0.15s",width:"100%",textAlign:"left"}}>
          <span style={{fontSize:16,fontWeight:800,color:i<3?C.accent:C.sub,width:28,textAlign:"center",flexShrink:0}}>{i+1}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{truncateName(b.name)}{b.id===myId&&<span style={{color:C.accent,marginLeft:6,fontSize:11}}>YOU</span>}</div>
            <div style={{fontSize:11,color:C.sub}}>Champion: {TEAMS[b.champion]?.name||"?"}{b.picks?.tiebreaker?` · Final: ${b.picks.tiebreaker.score1}-${b.picks.tiebreaker.score2}`:""}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:C.text}}>{b.score}</div>
              <div style={{fontSize:10,color:C.sub}}>pts</div>
            </div>
            <span style={{fontSize:14,color:C.sub}}>›</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── ADMIN PANEL ──────────────────────────────────────────────────────
function AdminPanel(){
  const [pw,setPw]=useState("");
  const [authed,setAuthed]=useState(false);
  const [res,setRes]=useState({});
  const [saving,setSaving]=useState(false);
  const [lastSaved,setLastSaved]=useState(null);

  useEffect(()=>{(async()=>{const r=await getResults();setRes(r||{});})();},[]);

  const resolve=k=>{if(typeof k==="string"&&k.startsWith("pi:"))return res[k.slice(3)]||null;return k;};

  const setResult=async(gid,winner)=>{
    const updated={...res,[gid]:winner};setRes(updated);setSaving(true);
    await saveResultsPicks(updated);
    setSaving(false);setLastSaved(new Date().toLocaleTimeString());
  };

  const clearResult=async(gid)=>{
    const updated={...res};delete updated[gid];setRes(updated);setSaving(true);
    await saveResultsPicks(updated);
    setSaving(false);setLastSaved(new Date().toLocaleTimeString());
  };

  // Build all games per round based on current results
  const allGames=useMemo(()=>{
    const rounds=[];

    // Play-in
    rounds.push({label:"First Four",games:PLAY_IN.map(pi=>({id:pi.id,t1:pi.t1,t2:pi.t2,region:pi.label}))});

    // R64
    const r64g=[];
    for(const reg of RORDER) R64[reg].forEach((pair,i)=>{
      const t1=resolve(pair[0]),t2=resolve(pair[1]);
      if(t1&&t2) r64g.push({id:`r64_${reg}_${i}`,t1,t2,region:RLABELS[reg]});
    });
    rounds.push({label:"Round of 64",games:r64g});

    // R32
    const r32g=[];
    for(const reg of RORDER) R32_PAIRS.forEach(([a,b],i)=>{
      const t1=res[`r64_${reg}_${a}`],t2=res[`r64_${reg}_${b}`];
      if(t1&&t2) r32g.push({id:`r32_${reg}_${i}`,t1,t2,region:RLABELS[reg]});
    });
    if(r32g.length) rounds.push({label:"Round of 32",games:r32g});

    // S16
    const s16g=[];
    for(const reg of RORDER) S16_PAIRS.forEach(([a,b],i)=>{
      const t1=res[`r32_${reg}_${a}`],t2=res[`r32_${reg}_${b}`];
      if(t1&&t2) s16g.push({id:`s16_${reg}_${i}`,t1,t2,region:RLABELS[reg]});
    });
    if(s16g.length) rounds.push({label:"Sweet 16",games:s16g});

    // E8
    const e8g=[];
    for(const reg of RORDER){
      const t1=res[`s16_${reg}_0`],t2=res[`s16_${reg}_1`];
      if(t1&&t2) e8g.push({id:`e8_${reg}`,t1,t2,region:RLABELS[reg]});
    }
    if(e8g.length) rounds.push({label:"Elite Eight",games:e8g});

    // FF
    const ffg=[];
    FF_PAIRS.forEach(([r1,r2],i)=>{
      const t1=res[`e8_${r1}`],t2=res[`e8_${r2}`];
      if(t1&&t2) ffg.push({id:`ff_${i}`,t1,t2,region:`${RLABELS[r1]} vs ${RLABELS[r2]}`});
    });
    if(ffg.length) rounds.push({label:"Final Four",games:ffg});

    // Champ
    const ct1=res.ff_0,ct2=res.ff_1;
    if(ct1&&ct2) rounds.push({label:"Championship",games:[{id:"champ",t1:ct1,t2:ct2,region:"Final"}]});

    return rounds;
  },[res]);

  if(!authed) return(
    <div style={{...page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:12,letterSpacing:4,color:C.red,fontWeight:700,marginBottom:4}}>ADMIN</div>
      <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:20}}>Enter Results</div>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw===ADMIN_PW)setAuthed(true);}} placeholder="Password" style={{...inputStyle,width:"100%",maxWidth:280,marginBottom:12,fontSize:16,padding:"14px 16px",textAlign:"center"}}/>
      <button onClick={()=>{if(pw===ADMIN_PW)setAuthed(true);}} style={{...btnPrimary,opacity:pw?1:0.5}}>Login</button>
      {pw&&pw!==ADMIN_PW&&pw.length>3&&<div style={{color:C.red,fontSize:13,marginTop:8}}>Incorrect password</div>}
    </div>
  );

  const completed=Object.keys(res).length;

  return(
    <div style={page}>
      <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,letterSpacing:3,color:C.red,fontWeight:700}}>ADMIN</div>
          <div style={{fontSize:20,fontWeight:900,color:C.text}}>Game Results</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:C.dim}}>{completed} results entered</div>
          {saving&&<div style={{fontSize:11,color:C.accent}}>Saving...</div>}
          {!saving&&lastSaved&&<div style={{fontSize:11,color:C.green}}>Saved {lastSaved}</div>}
        </div>
      </div>

      <div style={{padding:"8px 8px 40px",display:"flex",flexDirection:"column",gap:16}}>
        {allGames.map(rnd=>(
          <div key={rnd.label}>
            <div style={{fontSize:15,fontWeight:800,color:C.accent,marginBottom:8,letterSpacing:1}}>{rnd.label}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {rnd.games.map(g=>{
                const t1=TEAMS[g.t1],t2=TEAMS[g.t2];
                if(!t1||!t2) return null;
                const winner=res[g.id];
                return(
                  <div key={g.id} style={{background:C.card,borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
                    <div style={{padding:"4px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:C.sub,fontWeight:600}}>{g.region}</span>
                      {winner&&<button onClick={()=>clearResult(g.id)} style={{fontSize:10,color:C.red,background:"transparent",border:"none",cursor:"pointer",padding:"2px 6px"}}>Clear</button>}
                    </div>
                    {[g.t1,g.t2].map((tk,idx)=>{
                      const tm=TEAMS[tk],isW=winner===tk;
                      return(
                        <button key={tk} onClick={()=>setResult(g.id,tk)} style={{
                          display:"flex",alignItems:"center",padding:"10px 12px",gap:8,width:"100%",
                          background:isW?`${C.green}15`:"transparent",
                          border:"none",borderBottom:idx===0?`1px solid ${C.border}`:"none",
                          cursor:"pointer",
                        }}>
                          <span style={{fontSize:15,fontWeight:800,color:C.accent,width:22}}>{tm.seed}</span>
                          <span style={{fontSize:15,fontWeight:isW?800:500,color:isW?C.green:C.text,flex:1,textAlign:"left"}}>{tm.name}{isW&&" ✓"}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function App(){
  // Admin mode check
  const [isAdmin]=useState(()=>new URLSearchParams(window.location.search).get("admin")==="true");
  if(isAdmin) return <AdminPanel/>;

  const [appState,setAppState]=useState("loading"); // loading|mode_select|picking|review|submitted|locked|lookup
  const [mode,setMode]=useState(null);
  const [round,setRound]=useState(0);
  const [picks,setPicks]=useState({});
  const [regionFilter,setRegionFilter]=useState("east");
  const [myBracket,setMyBracket]=useState(null);
  const [myId,setMyId]=useState(null);
  const [brackets,setBrackets]=useState([]);
  const [results,setResults]=useState({});
  const [name,setName]=useState("");
  const [saving,setSaving]=useState(false);
  const [lookupName,setLookupName]=useState("");
  const [lookupResults,setLookupResults]=useState(null);
  const [activeTab,setActiveTab]=useState("bracket"); // bracket|leaderboard
  const [score1,setScore1]=useState("");
  const [score2,setScore2]=useState("");
  const [viewingBracket,setViewingBracket]=useState(null);

  // Init
  useEffect(()=>{
    (async()=>{
      const storedId=localStorage.getItem("mm_bracket_id");
      const now=new Date();
      const allB=await allBrackets()||[];
      const res=await getResults()||{};
      setBrackets(allB);setResults(res);
      if(storedId){
        const found=allB.find(b=>b.id===storedId);
        if(found){setMyBracket(found);setMyId(storedId);setPicks(found.picks||{});setMode(found.upset_mode);setAppState("submitted");return;}
      }
      if(now>=CUTOFF){setAppState("locked");return;}
      setAppState("mode_select");
    })();
  },[]);

  const resolve=k=>{if(typeof k==="string"&&k.startsWith("pi:"))return picks[k.slice(3)]||null;return k;};

  const games=useMemo(()=>{
    if(round===0)return PLAY_IN.map(pi=>({id:pi.id,t1:pi.t1,t2:pi.t2,region:pi.label,analysis:PI_NOTES[pi.id]}));
    if(round===1){const gs=[];for(const reg of RORDER)R64[reg].forEach((p,i)=>{const t1=resolve(p[0]),t2=resolve(p[1]);if(t1&&t2)gs.push({id:`r64_${reg}_${i}`,t1,t2,region:reg,analysis:adjustR64(R64_NOTES[reg][i],mode)});});return gs;}
    if(round===2){const gs=[];for(const reg of RORDER)R32_PAIRS.forEach(([a,b],i)=>{const t1=picks[`r64_${reg}_${a}`],t2=picks[`r64_${reg}_${b}`];if(t1&&t2)gs.push({id:`r32_${reg}_${i}`,t1,t2,region:reg,analysis:generateAnalysis(t1,t2,mode)});});return gs;}
    if(round===3){const gs=[];for(const reg of RORDER)S16_PAIRS.forEach(([a,b],i)=>{const t1=picks[`r32_${reg}_${a}`],t2=picks[`r32_${reg}_${b}`];if(t1&&t2)gs.push({id:`s16_${reg}_${i}`,t1,t2,region:reg,analysis:generateAnalysis(t1,t2,mode)});});return gs;}
    if(round===4){const gs=[];for(const reg of RORDER){const t1=picks[`s16_${reg}_0`],t2=picks[`s16_${reg}_1`];if(t1&&t2)gs.push({id:`e8_${reg}`,t1,t2,region:reg,analysis:generateAnalysis(t1,t2,mode)});}return gs;}
    if(round===5)return FF_PAIRS.map(([r1,r2],i)=>{const t1=picks[`e8_${r1}`],t2=picks[`e8_${r2}`];return t1&&t2?{id:`ff_${i}`,t1,t2,region:`${RLABELS[r1]} vs ${RLABELS[r2]}`,analysis:generateAnalysis(t1,t2,mode)}:null;}).filter(Boolean);
    if(round===6){const t1=picks.ff_0,t2=picks.ff_1;return t1&&t2?[{id:"champ",t1,t2,region:"Championship",analysis:generateAnalysis(t1,t2,mode)}]:[];}
    return[];
  },[round,picks,mode]);

  const showRegionToggle=round===1||round===2;
  const filteredGames=showRegionToggle?games.filter(g=>g.region===regionFilter):games;
  const expectedCount=round===0?4:round===1?32:round===2?16:round===3?8:round===4?4:round===5?2:1;
  const pickedCount=games.filter(g=>picks[g.id]).length;
  const pick=(gid,tk)=>setPicks(p=>({...p,[gid]:tk}));
  const hasScores=score1&&score2&&parseInt(score1)>0&&parseInt(score2)>0;
  const champReady=round===6&&picks.champ&&hasScores;
  const allPicked=round===6?champReady:(pickedCount===expectedCount&&games.length===expectedCount);
  const advance=()=>{if(round===6&&champReady)setAppState("review");else if(round<6){setRound(r=>r+1);setRegionFilter("east");window.scrollTo({top:0,behavior:"smooth"});}};
  const reset=()=>{setPicks({});setRound(0);setMode(null);setMyBracket(null);setMyId(null);setName("");setScore1("");setScore2("");setLookupName("");setLookupResults(null);setAppState("mode_select");localStorage.removeItem("mm_bracket_id");};

  const submitBracket=async()=>{
    if(!name.trim()||!isClean(name)||saving)return;setSaving(true);
    const tiebreaker={team1:picks.ff_0,score1:parseInt(score1)||0,team2:picks.ff_1,score2:parseInt(score2)||0};
    const fullPicks={...picks,tiebreaker};
    const res=await saveBracket(name.trim(),fullPicks,mode,picks.champ);
    if(res&&res[0]){
      const b=res[0];localStorage.setItem("mm_bracket_id",b.id);setMyBracket(b);setMyId(b.id);
      const allB=await allBrackets()||[];setBrackets(allB);setAppState("submitted");
    }
    setSaving(false);
  };

  const doLookup=async()=>{
    if(!lookupName.trim())return;
    const res=await searchBrackets(lookupName.trim());
    setLookupResults(res||[]);
  };

  const viewBracket=(b)=>{localStorage.setItem("mm_bracket_id",b.id);setMyBracket(b);setMyId(b.id);setPicks(b.picks||{});setMode(b.upset_mode);setLookupResults(null);setLookupName("");setAppState("submitted");};

  const regionPickCounts={};
  if(showRegionToggle)for(const reg of RORDER){const rg=games.filter(g=>g.region===reg);regionPickCounts[reg]={total:rg.length,picked:rg.filter(g=>picks[g.id]).length};}
  const modeInfo=UPSET_MODES.find(x=>x.id===mode);

  // ── LOADING ──
  if(appState==="loading") return <div style={{...page,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:C.sub,fontSize:16}}>Loading...</div></div>;

  // ── VIEWING SOMEONE'S BRACKET ──
  if(viewingBracket){
    const vb=viewingBracket;
    const vScore=calcScore(vb.picks||{},results);
    return(
      <div style={page}>
        <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,letterSpacing:3,color:C.accent,fontWeight:700}}>VIEWING BRACKET</div>
            <div style={{fontSize:20,fontWeight:900,color:C.text}}>{vb.name}</div>
          </div>
          <button onClick={()=>setViewingBracket(null)} style={btnGhost}>← Back</button>
        </div>
        <div style={{padding:"8px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:16,alignItems:"center"}}>
          <div><span style={{fontSize:11,color:C.sub}}>Score</span><div style={{fontSize:22,fontWeight:900,color:C.text}}>{vScore.score}</div></div>
          <div><span style={{fontSize:11,color:C.sub}}>Correct</span><div style={{fontSize:16,fontWeight:700,color:C.text}}>{vScore.correct}/{vScore.total}</div></div>
          <div><span style={{fontSize:11,color:C.sub}}>Mode</span><div style={{fontSize:13,fontWeight:600,color:C.dim}}>{modeLabel(vb.upset_mode)}</div></div>
        </div>
        <div style={{padding:"8px 0 20px"}}>
          <VisualBracket picks={vb.picks||{}} results={results}/>
        </div>
      </div>
    );
  }

  // ── LOCKED (past cutoff, no bracket) ──
  if(appState==="locked") return(
    <div style={page}>
      <div style={{textAlign:"center",padding:"40px 16px"}}>
        <div style={{fontSize:40,marginBottom:8}}>🔒</div>
        <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:8}}>Brackets Are Locked</div>
        <div style={{fontSize:14,color:C.sub,marginBottom:24}}>The submission deadline was 10:00 AM ET on March 18.</div>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Look up a submitted bracket:</div>
        <div style={{display:"flex",gap:8,maxWidth:320,margin:"0 auto",marginBottom:16}}>
          <input value={lookupName} onChange={e=>setLookupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLookup()} placeholder="Enter a name..." style={inputStyle}/>
          <button onClick={doLookup} style={btnSmall}>Search</button>
        </div>
        {lookupResults&&lookupResults.length===0&&<div style={{color:C.sub,fontSize:13}}>No brackets found for that name.</div>}
        {lookupResults&&lookupResults.map(b=>(
          <button key={b.id} onClick={()=>viewBracket(b)} style={{display:"block",width:"100%",maxWidth:320,margin:"6px auto",padding:"10px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>{b.name}</div>
            <div style={{fontSize:11,color:C.sub}}>Champion: {TEAMS[b.champion]?.name} · {modeLabel(b.upset_mode)}</div>
          </button>
        ))}
      </div>
      <Leaderboard brackets={brackets} results={results} myId={myId} onView={b=>setViewingBracket(b)}/>
    </div>
  );

  // ── MODE SELECT ──
  if(appState==="mode_select") return(
    <div style={{...page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:12,letterSpacing:4,color:C.accent,fontWeight:700,marginBottom:4}}>2026 MARCH MADNESS</div>
      <div style={{fontSize:30,fontWeight:900,marginBottom:4,color:C.text}}>Bracket Picker</div>
      <div style={{fontSize:15,color:C.dim,marginBottom:32,textAlign:"center",maxWidth:360}}>AI-powered analysis for every game. Pick your way through all 67 matchups.</div>
      <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>What's your upset tolerance?</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:400}}>
        {UPSET_MODES.map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);setAppState("picking");}} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",textAlign:"left",width:"100%"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;}}onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
            <span style={{fontSize:32}}>{m.emoji}</span>
            <div><div style={{fontSize:16,fontWeight:700,color:C.text}}>{m.label}</div><div style={{fontSize:13,color:C.dim,marginTop:2}}>{m.desc}</div></div>
          </button>
        ))}
      </div>
      <div style={{fontSize:12,color:C.sub,marginTop:24,textAlign:"center",maxWidth:320,lineHeight:1.5}}>Brackets lock at 10:00 AM ET on Wednesday, March 18.</div>

      <div style={{marginTop:32,width:"100%",maxWidth:400,borderTop:`1px solid ${C.border}`,paddingTop:24}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:10,textAlign:"center"}}>Already submitted a bracket?</div>
        <div style={{display:"flex",gap:8}}>
          <input value={lookupName} onChange={e=>setLookupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLookup()} placeholder="Search by name..." style={{...inputStyle,flex:1}}/>
          <button onClick={doLookup} style={btnSmall}>Find</button>
        </div>
        {lookupResults&&lookupResults.length===0&&<div style={{color:C.sub,fontSize:13,marginTop:8,textAlign:"center"}}>No brackets found for that name.</div>}
        {lookupResults&&lookupResults.length>0&&(
          <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
            {lookupResults.map(b=>(
              <button key={b.id} onClick={()=>viewBracket(b)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",textAlign:"left",width:"100%"}}>
                <div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{b.name}</div><div style={{fontSize:11,color:C.sub}}>Champion: {TEAMS[b.champion]?.name} · {modeLabel(b.upset_mode)}</div></div>
                <span style={{fontSize:12,color:C.accent,fontWeight:600}}>View →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── REVIEW (visual bracket + name entry) ──
  if(appState==="review"){
    const champ=TEAMS[picks.champ];
    return(
      <div style={page}>
        <div style={{textAlign:"center",padding:"16px 8px 8px"}}>
          <div style={{fontSize:12,letterSpacing:3,color:C.accent,fontWeight:700}}>YOUR BRACKET</div>
          <div style={{fontSize:14,color:C.sub,marginTop:4}}>{modeInfo?.emoji} {modeInfo?.label}</div>
        </div>
        <VisualBracket picks={picks} results={results}/>
        <div style={{padding:"16px 16px 100px",maxWidth:400,margin:"0 auto"}}>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8,textAlign:"center"}}>Submit Your Bracket</div>
          <div style={{fontSize:13,color:C.sub,marginBottom:16,textAlign:"center"}}>Enter your first name and last initial to join the leaderboard.</div>
          <input value={name} onChange={e=>setName(sanitizeName(e.target.value))} onKeyDown={e=>e.key==="Enter"&&submitBracket()} placeholder="e.g. Patrick M" style={{...inputStyle,width:"100%",marginBottom:4,fontSize:16,padding:"14px 16px"}}/>
          <div style={{fontSize:11,color:C.sub,marginBottom:12,textAlign:"center"}}>Leaderboard displays as: <span style={{color:C.accent,fontWeight:700}}>{name.trim()?truncateName(name):"Pat M."}</span></div>
          {name.trim()&&!isClean(name)&&<div style={{fontSize:12,color:C.red,marginBottom:8,textAlign:"center"}}>Please choose an appropriate name.</div>}
          <button onClick={submitBracket} disabled={!name.trim()||!isClean(name)||saving} style={{...btnPrimary,width:"100%",opacity:name.trim()&&isClean(name)?1:0.5}}>{saving?"Saving...":"Submit Bracket"}</button>
          <button onClick={()=>{setAppState("picking");setRound(6);}} style={{...btnGhost,width:"100%",marginTop:8}}>← Go Back and Edit</button>
        </div>
      </div>
    );
  }

  // ── SUBMITTED (your bracket + leaderboard) ──
  if(appState==="submitted"&&myBracket) return(
    <div style={page}>
      <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:11,letterSpacing:3,color:C.accent,fontWeight:700}}>2026 MARCH MADNESS</div><div style={{fontSize:20,fontWeight:900,color:C.text}}>Bracket Picker</div></div>
        <button onClick={reset} style={btnGhost}>New Bracket</button>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`}}>
        {["bracket","leaderboard"].map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{flex:1,padding:"10px",fontSize:14,fontWeight:activeTab===t?700:400,background:activeTab===t?C.card:C.bg,color:activeTab===t?C.text:C.sub,border:"none",borderBottom:activeTab===t?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer"}}>{t==="bracket"?`${myBracket.name}'s Bracket`:"Leaderboard"}</button>
        ))}
      </div>
      {activeTab==="bracket"&&(
        <div style={{padding:"8px 0 20px"}}>
          <VisualBracket picks={myBracket.picks||{}} results={results}/>
          <div style={{textAlign:"center",padding:"8px 16px"}}>
            <div style={{fontSize:12,color:C.sub}}>Mode: {modeLabel(myBracket.upset_mode)} · Submitted {new Date(myBracket.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      )}
      {activeTab==="leaderboard"&&<div style={{padding:"16px 0"}}><Leaderboard brackets={brackets} results={results} myId={myId} onView={b=>setViewingBracket(b)}/></div>}
    </div>
  );

  // ── PICKING ──
  return(
    <div style={page}>
      <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:11,letterSpacing:3,color:C.accent,fontWeight:700}}>2026 MARCH MADNESS</div><div style={{fontSize:20,fontWeight:900,color:C.text}}>Bracket Picker</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:12,color:C.dim}}>{modeInfo?.emoji} {modeInfo?.label}</div><div style={{fontSize:12,color:C.sub}}>{pickedCount}/{expectedCount} picked</div></div>
      </div>
      <div style={{display:"flex",overflowX:"auto",gap:3,padding:"8px 6px",borderBottom:`1px solid ${C.border}`}}>
        {ROUND_NAMES.map((n,i)=>(
          <button key={i} disabled={i>round} onClick={()=>{if(i<=round){setRound(i);setRegionFilter("east");}}} style={{padding:"6px 10px",fontSize:12,fontWeight:i===round?700:400,whiteSpace:"nowrap",background:i===round?C.accent:i<round?C.card:C.bg,color:i===round?C.bg:i<round?C.dim:C.sub,border:"none",borderRadius:4,cursor:i<=round?"pointer":"default",opacity:i>round?0.3:1}}>{n}</button>
        ))}
      </div>
      {showRegionToggle&&(
        <div style={{display:"flex",gap:5,padding:"10px 8px 6px"}}>
          {RORDER.map(reg=>{const rc=regionPickCounts[reg],isA=regionFilter===reg,isDone=rc&&rc.picked===rc.total;
            return(<button key={reg} onClick={()=>setRegionFilter(reg)} style={{flex:1,padding:"10px 4px",fontSize:13,fontWeight:isA?700:500,background:isA?`${RCOLORS[reg]}18`:C.card,color:isA?RCOLORS[reg]:C.dim,border:`1.5px solid ${isA?RCOLORS[reg]:C.border}`,borderRadius:6,cursor:"pointer",textAlign:"center"}}>
              {RLABELS[reg]}{rc&&<span style={{display:"block",fontSize:11,color:isDone?C.green:C.sub,marginTop:2}}>{rc.picked}/{rc.total}{isDone?" ✓":""}</span>}
            </button>);
          })}
        </div>
      )}
      <div style={{padding:"10px 14px 6px"}}>
        <span style={{fontSize:17,fontWeight:800,color:C.text}}>{ROUND_NAMES[round]}</span>
        {showRegionToggle&&<span style={{fontSize:14,color:RCOLORS[regionFilter],marginLeft:8,fontWeight:700}}>{RLABELS[regionFilter]}</span>}
        <div style={{fontSize:11,color:C.sub,marginTop:5,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}><span>AI confidence:</span><span><span style={{color:C.accent}}>★★★</span> Lock it in</span><span><span style={{color:C.accent}}>★★</span> Solid lean</span><span><span style={{color:C.accent}}>★</span> Coin flip</span></div>
      </div>
      <div style={{padding:"4px 8px 100px",display:"flex",flexDirection:"column",gap:10}}>
        {filteredGames.map(g=><GameCard key={g.id} game={g} picked={picks[g.id]} onPick={pick} mode={mode}/>)}
        {filteredGames.length===0&&<div style={{textAlign:"center",padding:40,color:C.sub,fontSize:14}}>No games in this region yet. Pick winners in the previous round first.</div>}

        {round===6&&picks.champ&&TEAMS[picks.ff_0]&&TEAMS[picks.ff_1]&&(
          <div style={{background:C.card,borderRadius:10,border:`1px solid ${C.accent}44`,padding:"16px 14px",marginTop:4}}>
            <div style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:4,textAlign:"center"}}>Tiebreaker</div>
            <div style={{fontSize:13,color:C.sub,marginBottom:14,textAlign:"center"}}>Predict the final score of the championship game.</div>
            <div style={{display:"flex",gap:12,alignItems:"center",justifyContent:"center"}}>
              <div style={{textAlign:"center",flex:1,maxWidth:140}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}><span style={{color:C.accent}}>{TEAMS[picks.ff_0].seed}</span> {TEAMS[picks.ff_0].name}</div>
                <input type="number" inputMode="numeric" min="0" max="200" value={score1} onChange={e=>setScore1(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="0" style={{...inputStyle,width:"100%",textAlign:"center",fontSize:24,fontWeight:800,padding:"10px 8px"}}/>
              </div>
              <div style={{fontSize:18,fontWeight:800,color:C.sub,paddingTop:20}}>—</div>
              <div style={{textAlign:"center",flex:1,maxWidth:140}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}><span style={{color:C.accent}}>{TEAMS[picks.ff_1].seed}</span> {TEAMS[picks.ff_1].name}</div>
                <input type="number" inputMode="numeric" min="0" max="200" value={score2} onChange={e=>setScore2(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="0" style={{...inputStyle,width:"100%",textAlign:"center",fontSize:24,fontWeight:800,padding:"10px 8px"}}/>
              </div>
            </div>
          </div>
        )}
      </div>
      {allPicked&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"14px 16px",background:`linear-gradient(transparent,${C.bg} 40%)`,textAlign:"center",zIndex:10}}>
          <button onClick={advance} style={{...btnPrimary,maxWidth:420,width:"100%"}}>{round===6?"Review Your Bracket →":`Continue to ${ROUND_NAMES[round+1]} →`}</button>
        </div>
      )}
    </div>
  );
}

function modeLabel(m){const f=UPSET_MODES.find(x=>x.id===m);return f?`${f.emoji} ${f.label}`:"Unknown";}
const page={fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:600,margin:"0 auto"};
const inputStyle={padding:"12px 14px",fontSize:14,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,outline:"none",flex:1};
const btnPrimary={padding:"14px 32px",fontSize:16,fontWeight:700,background:C.accent,color:C.bg,border:"none",borderRadius:10,cursor:"pointer",letterSpacing:0.5};
const btnGhost={padding:"10px 16px",fontSize:13,fontWeight:600,background:"transparent",color:C.sub,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer"};
const btnSmall={padding:"12px 16px",fontSize:14,fontWeight:700,background:C.accent,color:C.bg,border:"none",borderRadius:8,cursor:"pointer",flexShrink:0};
