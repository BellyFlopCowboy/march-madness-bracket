import { useState, useMemo } from "react";

// ── ALL 68 TEAMS ──────────────────────────────────────────────────────
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

  arizona:T("Arizona",1,"west","30-3",3,5,3,"Koa Peat (likely #1 pick)",null,"Elite two-way","Top-5 off & top-3 def; Big 12 champs","Lloyd 1-3 in NCAA tourneys (upset history)",9,6),
  liu:T("LIU",16,"west","18-15",216,239,186,null,null,"Mid-major","NEC champ","Severe talent gap",5,1),
  nova:T("Villanova",8,"west","22-10",33,41,35,null,"Matt Hodge OUT (season-ending ACL)","Balanced","8 straight R64 wins","Lost Hodge; thin; no tourney since 2022",5,7),
  utahst:T("Utah State",9,"west","27-6",30,28,44,"MJ Collins / Mason Falslev",null,"Guard-driven","KenPom higher than Villanova; elite guards","Defense #44 can leak",8,4),
  wiscy:T("Wisconsin",5,"west","24-8",22,11,51,"Kamari McGlynn / John Blackwell",null,"Offense-first","#11 offense; scorching hot late","Defense #51 below average",9,7),
  highpt:T("High Point",12,"west","27-6",92,66,161,null,null,"Offensive rebounding","Creates extra possessions","Defense #161; step up in class",7,2),
  arkansas:T("Arkansas",4,"west","24-9",18,6,52,"Darius Acuff Jr. (Kemba-esque freshman)",null,"Up-tempo offense","SEC champs; #6 offense; Calipari","Defense #52; can get outscored",10,9),
  hawaii:T("Hawaii",13,"west","24-8",107,207,42,null,null,"Defense-first","Big West champs","Haven't played a ranked opponent",7,1),
  byu:T("BYU",6,"west","23-9",23,10,57,"AJ Dybantsa (nation's leading scorer, likely #1 pick)","Richie Saunders OUT (season-ending ACL)","Star-driven","Dybantsa is electric; #10 offense","Under .500 since losing Saunders",6,4),
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
  iowa:T("Iowa",9,"south","22-11",25,31,31,"Bennett Stirtz 20.0 PPG",null,"Balanced","Best scoring D in Big Ten (66 PPG)","No elite ceiling; can be out-athleted",7,5),
  vandy:T("Vanderbilt",5,"south","25-8",11,7,29,"Tyler Tanner / Duke Miles",null,"Up-tempo","#7 offense; beat Florida by 17 in SEC tourney","Defense #29 can leak; under-seeded",9,5),
  mcneese:T("McNeese",12,"south","28-5",68,91,47,null,null,"Athletic defense","Southland champs; solid defense #47","Haven't faced this level",7,2),
  nebraska:T("Nebraska",4,"south","28-6",14,55,7,"Pryce Sandfort 17.9 PPG (40% 3PT)",null,"Defense-first","#7 defense; best in Big Ten","Never won an NCAA tourney game; offense #55",7,3),
  troy:T("Troy",13,"south","25-8",143,141,166,null,null,"Mid-major","Sun Belt champ; beat SDSU on road","Limited athleticism",7,3),
  unc:T("North Carolina",6,"south","23-9",29,32,37,"Seth Trimble / Henri Veesaar","Caleb Wilson OUT (season-ending broken thumb)","Diminished","Beat Duke; Trimble is elite defender","0-2 without Wilson; star freshman gone",3,8),
  vcu:T("VCU",11,"south","26-7",46,46,63,null,null,"Pressure defense","A-10 champs; 16-1 in last 17; shoot 3s well","Ceiling question in later rounds",9,3),
  illinois:T("Illinois",3,"south","26-6",7,1,28,"Keaton Wagler 40.2% 3PT, 4.4 APG",null,"Elite offense","#1 offense in nation; Wagler is gem","Defense #28 good not great",8,6),
  penn:T("Penn",14,"south","22-8",159,215,112,null,null,"Ivy League","Ivy champ; solid defense","Offense #215 can't keep up",6,2),
  stmarys:T("Saint Mary's",7,"south","27-5",24,43,19,null,null,"Pace-control defense","#19 defense; WCC pace-control","Offense #43 can stall; poor March history",7,7),
  texam:T("Texas A&M",10,"south","21-11",39,49,40,null,null,"Experienced","#8 most experienced per KenPom","First-year coach; few wins vs tourney teams",6,3),
  houston:T("Houston",2,"south","27-5",5,14,5,"Kingston Flemings / Milos Uzan",null,"Elite defense","#5 defense; title game last year; Houston site","Offense #14 can go cold",8,10),
  idaho:T("Idaho",15,"south","22-11",145,176,136,null,null,"Mid-major","Big Sky champ","Overmatched",6,1),
};

// ── BRACKET STRUCTURE ─────────────────────────────────────────────────
const PLAY_IN = [
  { id:"pi1", t1:"texas", t2:"ncstate", slot:"west_11", label:"West" },
  { id:"pi2", t1:"umbc", t2:"howard", slot:"mw_16", label:"Midwest" },
  { id:"pi3", t1:"pvam", t2:"lehigh", slot:"south_16", label:"South" },
  { id:"pi4", t1:"smu", t2:"miamioh", slot:"mw_11", label:"Midwest" },
];

const R64 = {
  east:[["duke","siena"],["ohiost","tcu"],["stjohns","niowa"],["kansas","calbap"],["louis","usf"],["michst","ndsu"],["ucla","ucf"],["uconn","furman"]],
  west:[["arizona","liu"],["nova","utahst"],["wiscy","highpt"],["arkansas","hawaii"],["byu","pi:pi1"],["gonzaga","kennesaw"],["miamifl","missouri"],["purdue","queens"]],
  midwest:[["michigan","pi:pi2"],["georgia","stlouis"],["ttech","akron"],["alabama","hofstra"],["tenn","pi:pi4"],["virginia","wrightst"],["kentucky","stclara"],["iowast","tennst"]],
  south:[["florida","pi:pi3"],["clemson","iowa"],["vandy","mcneese"],["nebraska","troy"],["unc","vcu"],["illinois","penn"],["stmarys","texam"],["houston","idaho"]],
};

const R32_PAIRS=[[0,1],[2,3],[4,5],[6,7]];
const S16_PAIRS=[[0,1],[2,3]];
const FF_PAIRS=[["east","midwest"],["west","south"]];

const PI_NOTES = {
  pi1:{rec:"texas",conf:"medium",note:"Texas has better size and Sean Miller's coaching edge. NC State is 2-7 in their last 9 and fading fast. Swain's scoring carries the Longhorns."},
  pi2:{rec:"umbc",conf:"low",note:"True toss-up. UMBC (KenPom 185) is more balanced than Howard (207). Howard has decent defense but can't generate enough offense (#283) to win."},
  pi3:{rec:"lehigh",conf:"low",note:"Slight edge to Lehigh with a better overall profile. Patriot League competition is a step above the SWAC this year."},
  pi4:{rec:"smu",conf:"medium",note:"Biggest gap in the First Four. SMU is KenPom 42 with elite offense (#26). Miami (OH) went undefeated in the MAC but is KenPom 93. Talent wins."},
};

const R64_NOTES = {
  east:[
    {rec:"duke",conf:"high",note:"Even without Foster, Duke's talent gap is enormous. Cameron Boozer controls the paint and Kon Knueppel spaces the floor. Siena (KenPom 192) has no path to an upset."},
    {rec:"ohiost",conf:"medium",note:"Classic toss-up, but Ohio State's late surge tips it. Thornton is averaging 21.8 PPG on elite shooting since Feb 26. TCU's #22 defense keeps it close, but OSU's hot offense wins a grind."},
    {rec:"stjohns",conf:"high",note:"Big East champs bring a #12 defense that will smother UNI's #153 offense. Northern Iowa's incredible MVC tourney run (4 wins in 4 nights) means heavy legs and a depleted bench."},
    {rec:"kansas",conf:"high",note:"Cal Baptist's first-ever tournament appearance against Bill Self's experience and Bidunga's rim protection. The stage is too big for the Lancers."},
    {rec:"louis",conf:"medium",note:"Hinges on Jalen Brown's back. Even without him, Conwell and McKneely can score enough. South Florida is tough (KenPom 49), but Louisville's size edges them in the half court."},
    {rec:"michst",conf:"high",note:"Izzo in March. Fears has scored 20+ in four straight games — the hottest player entering the tourney. NDSU can't match MSU's athleticism. Trust the Spartan pedigree."},
    {rec:"ucf",conf:"medium",note:"🔥 UPSET WATCH. Bilodeau's knee strain limits UCLA's best player — they lost badly in the Big Ten semis without him. UCF's Fulks and Stillwell exploit it. A coin flip where the injury tips the scale."},
    {rec:"uconn",conf:"high",note:"UConn's defense (#11) and tournament DNA are overwhelming. Lost the Big East final but remain experienced and well-coached. Furman (KenPom 190) is outclassed."},
  ],
  west:[
    {rec:"arizona",conf:"high",note:"Massive mismatch. Arizona's #5 offense and #3 defense vs KenPom 216. Koa Peat could rest starters in the second half."},
    {rec:"utahst",conf:"medium",note:"🔥 UPSET WATCH. Villanova lost Matt Hodge (ACL). Utah State (KenPom 30) actually outranks Nova (33). Collins and Falslev are an elite guard duo. Nova's R64 streak ends here."},
    {rec:"wiscy",conf:"medium",note:"High Point creates extra possessions with offensive rebounding, but Wisconsin's been scorching hot down the stretch. The #11 offense (McGlynn, Blackwell) is too much for the Big South."},
    {rec:"arkansas",conf:"high",note:"Calipari's SEC tourney champs are rolling. Acuff is a Kemba-esque freshman who takes over games. Hawaii hasn't played a ranked opponent all year. Talent gap is severe."},
    {rec:"byu",conf:"medium",note:"Dybantsa is the best player on the floor — the nation's leading scorer and likely #1 pick. Even without Saunders, Dybantsa and Wright III have the firepower. Play-in winner will be tired."},
    {rec:"gonzaga",conf:"high",note:"Even without Huff, Graham Ike (19.7 PPG career-high) is dominant in the post. The Zags won the WCC tourney with depth and experience. Kennesaw (KenPom 163) is overmatched."},
    {rec:"miamifl",conf:"medium",note:"First-year coach Lucas has Miami at 25-8 with a balanced profile (KenPom 31). Missouri (KenPom 52) made the tourney again under Gates but Miami's ACC experience translates better."},
    {rec:"purdue",conf:"high",note:"Smith needs just 2 assists to break Bobby Hurley's all-time record. Purdue's #2 offense is historically elite. Queens (first tourney, #322 defense) is overwhelmed."},
  ],
  midwest:[
    {rec:"michigan",conf:"high",note:"Michigan's #1 defense and KenPom #2 overall. Lendeborg, Mara (7'2\"), and Johnson form the most imposing frontcourt in college basketball. Play-in winner has no chance."},
    {rec:"georgia",conf:"medium",note:"Georgia's #16 offense is potent enough to outscore disciplined Saint Louis. SLU (KenPom 41) is solid but Georgia's ceiling is higher. Bad defense (#80) keeps it interesting though."},
    {rec:"ttech",conf:"medium",note:"Without Toppin, TTech is jump-shot dependent and the line has dropped to -7.5. But Anderson and McCasland's scheming survive. Akron's 37%+ shooting trio makes this an upset watch."},
    {rec:"alabama",conf:"medium",note:"Even without Holloway (off team), Philon is an elite scorer and Bama still has the #3 offense. Down to 9 scholarship players hurts depth, but the talent gap over Hofstra holds."},
    {rec:"tenn",conf:"medium",note:"Tennessee's defense (#15) is a nightmare matchup. Gillespie and Ament are a 1-2 punch the play-in winner can't match. The Vols grind this out."},
    {rec:"virginia",conf:"high",note:"Virginia's trademark defense (#16) smothers Wright State's young roster. Thomas and de Ridder provide enough offense. Wright State's freshmen aren't ready for this stage."},
    {rec:"kentucky",conf:"medium",note:"KenPom near-coin-flip (28 vs 35) but Kentucky has frontcourt size and Pope's preparation. Santa Clara's offense (#23) is elite but their defense (#82) leaks. UK's size wins."},
    {rec:"iowast",conf:"high",note:"Iowa State's #4 defense is elite. Jefferson (16.9/7.6/4.9) is the most complete big man in the tourney. Tennessee State (KenPom 187) is outmatched on every metric."},
  ],
  south:[
    {rec:"florida",conf:"high",note:"Defending champs have the best frontcourt in college basketball. Condon, Haugh, Chinyelu, Handlogten are matchup nightmares on the glass. Play-in winner has zero chance."},
    {rec:"iowa",conf:"medium",note:"🔥 UPSET WATCH. Clemson lost Carter Welling (ACL) in the ACC tourney. Iowa's Stirtz averages 20 PPG and the Hawkeyes hold opponents to 66 PPG in Big Ten play. Welling's absence is decisive."},
    {rec:"vandy",conf:"medium",note:"Vanderbilt's #7 offense is elite — Tanner and Miles lead a steal-happy backcourt. McNeese (KenPom 68) is athletic but lacks the half-court scoring to keep pace."},
    {rec:"nebraska",conf:"medium",note:"Nebraska has never won an NCAA tourney game — this is the year. Sandfort (17.9 PPG, 40% 3PT) leads the charge and the #7 defense is elite. Troy is well-coached but outgunned."},
    {rec:"vcu",conf:"medium",note:"🔥 UPSET WATCH. Without Caleb Wilson, UNC is 0-2 and got crushed by Duke. VCU has won 16 of 17 under Martelli Jr. and shoots it well from deep. UNC is only a 3-pt favorite — the market knows."},
    {rec:"illinois",conf:"high",note:"Illinois has the #1 offense in the country. Wagler's 40.2% from 3 and 4.4 APG drive a machine Penn (KenPom 159) simply cannot slow down."},
    {rec:"stmarys",conf:"medium",note:"Saint Mary's defense (#19) grinds opponents into submission by controlling pace. A&M's experience (#8 per KenPom) is a factor, but the Gaels have the discipline to control tempo."},
    {rec:"houston",conf:"high",note:"Houston's defense (#5) and physicality overwhelm Idaho (KenPom 145). The Cougars are on a mission after last year's title game loss."},
  ],
};

// ── UPSET TOLERANCE CONFIG ────────────────────────────────────────────
const UPSET_MODES = [
  { id:"chalk", label:"By the Books", emoji:"📚", desc:"Trust the seeds. Higher-ranked teams win.", injWeight:0.5, momWeight:0.3, kpFloor:0, seedBonus:2 },
  { id:"calculated", label:"Calculated Risks", emoji:"🎯", desc:"Data-backed upsets only. Injuries and matchups matter.", injWeight:1.5, momWeight:0.8, kpFloor:0, seedBonus:0.5 },
  { id:"chaos", label:"Cinderella Season", emoji:"👠", desc:"Lean into momentum and injury advantages.", injWeight:2.5, momWeight:1.5, kpFloor:0, seedBonus:-0.5 },
  { id:"madness", label:"Bracket Arsonist", emoji:"🔥", desc:"Maximum chaos. Underdogs with any edge get the nod.", injWeight:3, momWeight:2.5, kpFloor:0, seedBonus:-1.5 },
];

// ── DYNAMIC ANALYSIS ENGINE ──────────────────────────────────────────
function generateAnalysis(t1key, t2key, mode) {
  const a = TEAMS[t1key], b = TEAMS[t2key];
  if(!a||!b) return {rec:t1key,conf:"low",note:"Matchup data unavailable."};
  const m = UPSET_MODES.find(x=>x.id===mode) || UPSET_MODES[1];

  let aScore=0, bScore=0, reasons=[];

  // Seed bonus (chalk = big bonus for higher seed)
  if (a.seed < b.seed) { aScore += m.seedBonus; }
  else if (b.seed < a.seed) { bScore += m.seedBonus; }

  // KenPom
  const kpDiff = b.kp - a.kp;
  if(Math.abs(kpDiff)>20){if(kpDiff>0){aScore+=2.5;reasons.push(`${a.name} has a significant KenPom edge (#${a.kp} vs #${b.kp})`);}else{bScore+=2.5;reasons.push(`${b.name} has a significant KenPom edge (#${b.kp} vs #${a.kp})`);}}
  else if(Math.abs(kpDiff)>8){if(kpDiff>0)aScore+=1;else bScore+=1;}

  // Off vs Def matchup
  const aOvD=b.def-a.off, bOvD=a.def-b.off;
  if(aOvD>30){aScore+=2;reasons.push(`${a.name}'s offense (#${a.off}) should exploit ${b.name}'s defense (#${b.def})`);}else if(aOvD>15)aScore+=1;
  if(bOvD>30){bScore+=2;reasons.push(`${b.name}'s offense (#${b.off}) should exploit ${a.name}'s defense (#${a.def})`);}else if(bOvD>15)bScore+=1;

  // Coaching & March (2nd priority)
  const marchDiff = a.march - b.march;
  if(marchDiff>=3){aScore+=1.5;reasons.push(`${a.name} has a major coaching and March experience advantage`);}else if(marchDiff>=1)aScore+=0.5;
  if(marchDiff<=-3){bScore+=1.5;reasons.push(`${b.name} has a major coaching and March experience advantage`);}else if(marchDiff<=-1)bScore+=0.5;

  // Momentum (weighted by mode)
  const momDiff = a.mom - b.mom;
  if(momDiff>=3){aScore+=m.momWeight*1.5;reasons.push(`${a.name} has significantly better momentum (${a.mom}/10 vs ${b.mom}/10)`);}else if(momDiff>=1)aScore+=m.momWeight*0.5;
  if(momDiff<=-3){bScore+=m.momWeight*1.5;reasons.push(`${b.name} has significantly better momentum (${b.mom}/10 vs ${a.mom}/10)`);}else if(momDiff<=-1)bScore+=m.momWeight*0.5;

  // Injuries (weighted by mode)
  const injPenalty = (inj) => {
    if (!inj) return 0;
    if (inj.includes("OUT") || inj.includes("SUSPENDED")) return m.injWeight * 1.5;
    if (inj.includes("DTD") || inj.includes("GTD")) return m.injWeight * 0.8;
    return 0;
  };
  const aInjP = injPenalty(a.inj), bInjP = injPenalty(b.inj);
  if(aInjP > 0){bScore+=aInjP; reasons.push(`${a.name} dealing with: ${a.inj.split(";")[0].trim()}`);}
  if(bInjP > 0){aScore+=bInjP; reasons.push(`${b.name} dealing with: ${b.inj.split(";")[0].trim()}`);}

  const winner = aScore>=bScore ? t1key : t2key;
  const loser = winner===t1key ? t2key : t1key;
  const w=TEAMS[winner], l=TEAMS[loser];
  const margin=Math.abs(aScore-bScore);
  const conf = margin>4?"high":margin>1.5?"medium":"low";
  const topR = reasons.slice(0,3).join(". ");
  const note = topR ? `${topR}.` : `Tight matchup. ${w.name} (KenPom #${w.kp}) edges ${l.name} (KenPom #${l.kp}) on overall profile.`;
  return {rec:winner,conf,note};
}

// Adjust pre-written R64 notes based on upset mode
function adjustR64Note(note, mode) {
  if (mode === "chalk") {
    // For chalk mode, flip upset recommendations to favor higher seed
    if (note.note.includes("UPSET")) {
      return { ...note, conf: "low", note: note.note.replace("🔥 UPSET WATCH. ","⚠️ Upset possible, but: ") };
    }
    return note;
  }
  if (mode === "madness") {
    if (note.note.includes("UPSET")) {
      return { ...note, conf: "high", note: note.note.replace("🔥 UPSET WATCH.","🔥 PULL THE TRIGGER.") };
    }
    return note;
  }
  return note;
}

// ── UI CONSTANTS ──────────────────────────────────────────────────────
const ROUND_NAMES=["First Four","Round of 64","Round of 32","Sweet 16","Elite Eight","Final Four","Championship"];
const REGION_LABELS={east:"East",west:"West",midwest:"Midwest",south:"South"};
const REGION_COLORS={east:"#3b82f6",west:"#f97316",midwest:"#a855f7",south:"#10b981"};
const REGIONS_ORDER=["east","west","midwest","south"];

const C = {
  bg:"#0a0e1a",card:"#111827",accent:"#f59e0b",green:"#22c55e",red:"#ef4444",
  text:"#f1f5f9",dim:"#94a3b8",sub:"#7d8ca1",muted:"#576274",border:"#1e293b",surface:"#0f172a",
};

// ── COMPONENTS ────────────────────────────────────────────────────────
function InjuryBadge({ team }) {
  if (!team.inj) return null;
  return <div style={{ fontSize:12, color:C.red, marginTop:3, lineHeight:1.3 }}>⚕ {team.inj}</div>;
}

function GameCard({ game, picked, onPick, mode }) {
  const t1=TEAMS[game.t1], t2=TEAMS[game.t2];
  if(!t1||!t2) return null;
  const anal = game.analysis;
  const hasAnyInjury = t1.inj || t2.inj;
  const isUpset = anal?.note?.includes("UPSET") || anal?.note?.includes("TRIGGER");

  return (
    <div style={{ background:C.card, borderRadius:10, overflow:"hidden", border:`1px solid ${C.border}` }}>
      {/* Teams */}
      {[game.t1,game.t2].map((tk,idx)=>{
        const tm=TEAMS[tk];
        const isRec = anal?.rec===tk;
        const isPicked = picked===tk;
        const isLoser = picked && picked!==tk;
        return (
          <button key={tk} onClick={()=>onPick(game.id,tk)} style={{
            display:"flex",alignItems:"center",padding:"12px 14px",gap:10,width:"100%",
            background:isPicked?`${C.green}0d`:isLoser?C.surface:"transparent",
            border:"none",borderBottom:idx===0?`1px solid ${C.border}`:"none",
            cursor:"pointer",opacity:isLoser?0.35:1,transition:"all 0.15s",
          }}>
            <span style={{fontSize:17,fontWeight:800,color:C.accent,width:24,textAlign:"center",flexShrink:0}}>{tm.seed}</span>
            <div style={{flex:1,textAlign:"left",minWidth:0}}>
              <div style={{fontSize:16,fontWeight:isPicked?800:600,color:isPicked?C.green:C.text,display:"flex",alignItems:"center",gap:4}}>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tm.name}</span>
                {isPicked && <span style={{fontSize:13,flexShrink:0}}>✓</span>}
              </div>
              <div style={{fontSize:12,color:C.sub,marginTop:2}}>{tm.rec} · KP #{tm.kp} · Off #{tm.off} · Def #{tm.def}</div>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
              {tm.inj && <span style={{fontSize:12,color:C.red}}>⚕</span>}
              {isRec && (
                <span style={{fontSize:11,background:`${C.accent}1a`,color:C.accent,padding:"3px 8px",borderRadius:4,fontWeight:700,lineHeight:1,whiteSpace:"nowrap"}}>
                  {anal.conf==="high"?"AI Pick ★★★":anal.conf==="medium"?"AI Pick ★★":"AI Pick ★"}
                </span>
              )}
            </div>
          </button>
        );
      })}
      {/* Analysis panel */}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,background:C.surface}}>
        {isUpset && <div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:4,letterSpacing:1}}>UPSET ALERT</div>}
        <div style={{fontSize:13,color:C.dim,lineHeight:1.55}}>
          <span style={{color:C.accent,fontWeight:700}}>AI Pick: </span>
          <span style={{color:C.text,fontWeight:600}}>{TEAMS[anal?.rec]?.name || "—"}</span>
          <span style={{color:C.sub}}> — </span>
          {anal?.note}
        </div>
        {hasAnyInjury && (
          <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.border}`}}>
            {t1.inj && <div style={{fontSize:12,color:C.red,lineHeight:1.4}}>⚕ {t1.name}: {t1.inj}</div>}
            {t2.inj && <div style={{fontSize:12,color:C.red,lineHeight:1.4}}>⚕ {t2.name}: {t2.inj}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function BracketPicker() {
  const [mode,setMode] = useState(null);
  const [round,setRound] = useState(0);
  const [picks,setPicks] = useState({});
  const [regionFilter,setRegionFilter] = useState("east");
  const [showSummary,setShowSummary] = useState(false);

  const resolve=(key)=>{
    if(typeof key==="string"&&key.startsWith("pi:")){return picks[key.slice(3)]||null;}return key;
  };

  const games = useMemo(()=>{
    if(round===0) return PLAY_IN.map(pi=>({id:pi.id,t1:pi.t1,t2:pi.t2,region:pi.label,analysis:PI_NOTES[pi.id]}));

    if(round===1){
      const gs=[];
      for(const reg of REGIONS_ORDER){
        R64[reg].forEach((pair,i)=>{
          const t1=resolve(pair[0]),t2=resolve(pair[1]);
          if(t1&&t2) gs.push({id:`r64_${reg}_${i}`,t1,t2,region:reg,analysis:adjustR64Note(R64_NOTES[reg][i],mode)});
        });
      }
      return gs;
    }
    if(round===2){
      const gs=[];
      for(const reg of REGIONS_ORDER){
        R32_PAIRS.forEach(([a,b],i)=>{
          const t1=picks[`r64_${reg}_${a}`],t2=picks[`r64_${reg}_${b}`];
          if(t1&&t2) gs.push({id:`r32_${reg}_${i}`,t1,t2,region:reg,analysis:generateAnalysis(t1,t2,mode)});
        });
      }
      return gs;
    }
    if(round===3){
      const gs=[];
      for(const reg of REGIONS_ORDER){
        S16_PAIRS.forEach(([a,b],i)=>{
          const t1=picks[`r32_${reg}_${a}`],t2=picks[`r32_${reg}_${b}`];
          if(t1&&t2) gs.push({id:`s16_${reg}_${i}`,t1,t2,region:reg,analysis:generateAnalysis(t1,t2,mode)});
        });
      }
      return gs;
    }
    if(round===4){
      const gs=[];
      for(const reg of REGIONS_ORDER){
        const t1=picks[`s16_${reg}_0`],t2=picks[`s16_${reg}_1`];
        if(t1&&t2) gs.push({id:`e8_${reg}`,t1,t2,region:reg,analysis:generateAnalysis(t1,t2,mode)});
      }
      return gs;
    }
    if(round===5){
      return FF_PAIRS.map(([r1,r2],i)=>{
        const t1=picks[`e8_${r1}`],t2=picks[`e8_${r2}`];
        if(t1&&t2) return {id:`ff_${i}`,t1,t2,region:`${REGION_LABELS[r1]} vs ${REGION_LABELS[r2]}`,analysis:generateAnalysis(t1,t2,mode)};
        return null;
      }).filter(Boolean);
    }
    if(round===6){
      const t1=picks.ff_0,t2=picks.ff_1;
      if(t1&&t2) return [{id:"champ",t1,t2,region:"National Championship",analysis:generateAnalysis(t1,t2,mode)}];
      return [];
    }
    return [];
  },[round,picks,mode]);

  // For R64 and R32, filter by region
  const showRegionToggle = round===1 || round===2;
  const filteredGames = showRegionToggle ? games.filter(g=>g.region===regionFilter) : games;

  const expectedCount = round===0?4:round===1?32:round===2?16:round===3?8:round===4?4:round===5?2:1;
  const pickedCount = games.filter(g=>picks[g.id]).length;
  const allPicked = pickedCount===expectedCount && games.length===expectedCount;

  const pick=(gid,tk)=>setPicks(p=>({...p,[gid]:tk}));
  const advance=()=>{
    if(round===6&&picks.champ){setShowSummary(true);}
    else{setRound(r=>r+1);setRegionFilter("east");window.scrollTo({top:0,behavior:"smooth"});}
  };
  const reset=()=>{setPicks({});setRound(0);setShowSummary(false);setMode(null);};

  const champion = picks.champ ? TEAMS[picks.champ] : null;

  // ── MODE SELECT SCREEN ──────────────────────────────────────────────
  if (!mode) {
    return (
      <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{fontSize:12,letterSpacing:4,color:C.accent,fontWeight:700,marginBottom:4}}>2026 MARCH MADNESS</div>
        <div style={{fontSize:30,fontWeight:900,marginBottom:4}}>Bracket Picker</div>
        <div style={{fontSize:15,color:C.dim,marginBottom:32,textAlign:"center",maxWidth:360}}>AI-powered analysis for every game. Pick your way through all 67 matchups.</div>

        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>What's your upset tolerance?</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:400}}>
          {UPSET_MODES.map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)} style={{
              display:"flex",alignItems:"center",gap:14,padding:"16px 18px",
              background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
              cursor:"pointer",textAlign:"left",transition:"all 0.2s",width:"100%",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.surface;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}
            >
              <span style={{fontSize:32}}>{m.emoji}</span>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:C.text}}>{m.label}</div>
                <div style={{fontSize:13,color:C.dim,marginTop:2}}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{fontSize:12,color:C.sub,marginTop:24,textAlign:"center",maxWidth:320,lineHeight:1.5}}>This adjusts how the AI weights injuries, momentum, and seed advantages in its recommendations. You can still pick whoever you want.</div>
      </div>
    );
  }

  // ── SUMMARY SCREEN ──────────────────────────────────────────────────
  if (showSummary && champion) {
    const modeInfo = UPSET_MODES.find(x=>x.id===mode);
    // Gather path
    const bracketPath = [];
    const roundKeys = [
      {prefix:"r64_",label:"Round of 64"},
      {prefix:"r32_",label:"Round of 32"},
      {prefix:"s16_",label:"Sweet 16"},
      {prefix:"e8_",label:"Elite Eight"},
      {prefix:"ff_",label:"Final Four"},
    ];
    for(const rk of roundKeys){
      const rp=Object.entries(picks).filter(([k])=>k.startsWith(rk.prefix)).map(([,v])=>TEAMS[v]).filter(Boolean);
      if(rp.length) bracketPath.push({label:rk.label,teams:rp});
    }

    return (
      <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",padding:24}}>
        <div style={{textAlign:"center",maxWidth:500,margin:"0 auto"}}>
          <div style={{fontSize:14,letterSpacing:3,color:C.accent,fontWeight:700}}>YOUR 2026 CHAMPION</div>
          <div style={{fontSize:40,fontWeight:900,margin:"8px 0"}}>🏀 {champion.name}</div>
          <div style={{fontSize:15,color:C.dim}}>{champion.rec} · KenPom #{champion.kp} · {champion.seed}-seed</div>
          <div style={{fontSize:13,color:C.sub,marginTop:8}}>Mode: {modeInfo?.emoji} {modeInfo?.label}</div>

          <div style={{marginTop:28,textAlign:"left"}}>
            {bracketPath.map(rnd=>(
              <div key={rnd.label} style={{marginBottom:14}}>
                <div style={{fontSize:12,color:C.sub,fontWeight:700,letterSpacing:1,marginBottom:6}}>{rnd.label.toUpperCase()}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {rnd.teams.map((tm,i)=>(
                    <span key={i} style={{background:C.card,border:`1px solid ${C.border}`,padding:"5px 12px",borderRadius:6,fontSize:13,color:C.text}}>
                      <span style={{color:C.accent,fontWeight:700,marginRight:4}}>{tm.seed}</span>{tm.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:28}}>
            <button onClick={reset} style={{padding:"12px 28px",fontSize:14,fontWeight:700,background:C.card,color:C.text,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer"}}>Start Over</button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN BRACKET SCREEN ─────────────────────────────────────────────
  const modeInfo = UPSET_MODES.find(x=>x.id===mode);

  // Count picks per region for R64/R32
  const regionPickCounts = {};
  if (showRegionToggle) {
    for (const reg of REGIONS_ORDER) {
      const regGames = games.filter(g=>g.region===reg);
      const regPicked = regGames.filter(g=>picks[g.id]).length;
      regionPickCounts[reg] = { total:regGames.length, picked:regPicked };
    }
  }

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:600,margin:"0 auto"}}>
      {/* Header */}
      <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,letterSpacing:3,color:C.accent,fontWeight:700}}>2026 MARCH MADNESS</div>
          <div style={{fontSize:20,fontWeight:900}}>Bracket Picker</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:C.dim}}>{modeInfo?.emoji} {modeInfo?.label}</div>
          <div style={{fontSize:12,color:C.sub}}>{pickedCount}/{expectedCount} picked</div>
        </div>
      </div>

      {/* Round Nav */}
      <div style={{display:"flex",overflowX:"auto",gap:3,padding:"8px 6px",borderBottom:`1px solid ${C.border}`}}>
        {ROUND_NAMES.map((name,i)=>(
          <button key={i} disabled={i>round} onClick={()=>{if(i<=round){setRound(i);setRegionFilter("east");}}} style={{
            padding:"6px 10px",fontSize:12,fontWeight:i===round?700:400,whiteSpace:"nowrap",
            background:i===round?C.accent:i<round?C.card:C.bg,
            color:i===round?C.bg:i<round?C.dim:C.sub,
            border:"none",borderRadius:4,cursor:i<=round?"pointer":"default",
            opacity:i>round?0.3:1,
          }}>{name}</button>
        ))}
      </div>

      {/* Region Toggle (R64 & R32 only) */}
      {showRegionToggle && (
        <div style={{display:"flex",gap:5,padding:"10px 8px 6px"}}>
          {REGIONS_ORDER.map(reg=>{
            const rc = regionPickCounts[reg];
            const isActive = regionFilter===reg;
            const isDone = rc && rc.picked===rc.total;
            return (
              <button key={reg} onClick={()=>setRegionFilter(reg)} style={{
                flex:1,padding:"10px 4px",fontSize:13,fontWeight:isActive?700:500,
                background:isActive?`${REGION_COLORS[reg]}18`:C.card,
                color:isActive?REGION_COLORS[reg]:C.dim,
                border:`1.5px solid ${isActive?REGION_COLORS[reg]:C.border}`,
                borderRadius:6,cursor:"pointer",textAlign:"center",transition:"all 0.15s",position:"relative",
              }}>
                {REGION_LABELS[reg]}
                {rc && <span style={{display:"block",fontSize:11,color:isDone?C.green:C.sub,marginTop:2}}>{rc.picked}/{rc.total}{isDone?" ✓":""}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Round label + legend */}
      <div style={{padding:"10px 14px 6px"}}>
        <span style={{fontSize:17,fontWeight:800,color:C.text}}>{ROUND_NAMES[round]}</span>
        {showRegionToggle && <span style={{fontSize:14,color:REGION_COLORS[regionFilter],marginLeft:8,fontWeight:700}}>{REGION_LABELS[regionFilter]}</span>}
        <div style={{fontSize:11,color:C.sub,marginTop:5,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <span>AI confidence:</span>
          <span><span style={{color:C.accent}}>★★★</span> Lock it in</span>
          <span><span style={{color:C.accent}}>★★</span> Solid lean</span>
          <span><span style={{color:C.accent}}>★</span> Coin flip</span>
        </div>
      </div>

      {/* Games */}
      <div style={{padding:"4px 8px 100px",display:"flex",flexDirection:"column",gap:10}}>
        {filteredGames.map(game=>(
          <GameCard key={game.id} game={game} picked={picks[game.id]} onPick={pick} mode={mode} />
        ))}
        {filteredGames.length===0 && (
          <div style={{textAlign:"center",padding:40,color:C.sub,fontSize:14}}>
            No games in this region yet. Pick winners in the previous round first.
          </div>
        )}
      </div>

      {/* Advance button */}
      {allPicked && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"14px 16px",background:`linear-gradient(transparent,${C.bg} 40%)`,textAlign:"center",zIndex:10}}>
          <button onClick={advance} style={{
            padding:"14px 32px",fontSize:16,fontWeight:700,background:C.accent,color:C.bg,
            border:"none",borderRadius:10,cursor:"pointer",letterSpacing:0.5,
            boxShadow:`0 0 20px ${C.accent}33`,maxWidth:420,width:"100%",
          }}>
            {round===6?"🏆 See Your Champion":`Continue to ${ROUND_NAMES[round+1]} →`}
          </button>
        </div>
      )}
    </div>
  );
}
