import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, LayoutDashboard, CheckSquare, Settings, Trash2, X, TrendingUp, Home, Car, Zap, ShieldCheck, Landmark, Receipt, CheckCircle2, Sparkles, Briefcase, User, BookOpen, Moon, Sun, Lock, Shield, Camera, FileText, AlertCircle, Check, Clock, FileSignature, Coffee, Building2, Target, ChevronRight, ChevronDown, Wallet, Award, ArrowUpRight, Edit3, BarChart3, Star, Crown, Heart, Lightbulb, GraduationCap, Play, MessageCircle, Send, HelpCircle, Flame, Trophy, Archive, FolderOpen, Tag, Mail, Eye, EyeOff, LogOut } from 'lucide-react';
import { supabase, auth, db } from './supabase.js';

const IM={Home,Car,Zap,ShieldCheck,Landmark,Receipt,Shield,Building2,Coffee,Target,Wallet,TrendingUp,Briefcase,Heart,Star,Trophy,GraduationCap,Crown,Lightbulb,BookOpen,Camera,FileText};
const gi=n=>IM[n]||Receipt;
const DE=[{label:'Loyer / Hypothèque',amount:1500,category:'Habitation',icon:'Home'},{label:'Assurance LAMal',amount:350,category:'Santé',icon:'ShieldCheck'},{label:'Leasing / Auto',amount:330,category:'Transport',icon:'Car'}];
const DP=[{label:'Loyer Bureau',amount:800,category:'Loyer',icon:'Building2'},{label:'Assurances RC Pro',amount:150,category:'Assurance',icon:'Shield'},{label:'Abonnements',amount:120,category:'Admin',icon:'Zap'}];
const EC=['Marchandises','Déplacement','Repas & Représentation','Publicité','Sous-traitants','Admin & Divers'];
const GP=[{l:'Achat immobilier',i:'Home',a:100000},{l:'Fonds d\'urgence',i:'Shield',a:15000},{l:'Véhicule',i:'Car',a:25000},{l:'Voyage / Projet',i:'Target',a:5000},{l:'Objectif libre',i:'Star',a:10000}];
const IP=[
  {n:'3A Titres',r:.05,ri:'Modéré',rc:'text-amber-600 bg-amber-100',mx:7056,d:'Enveloppe fiscale + fonds.',p:['Avantage fiscal','4-7%/an','Composés'],c:['Risque perte','Bloqué','Frais'],lv:'Double levier: fiscal + composés. 20 ans → ~245k.'},
  {n:'ETF Indiciels',r:.07,ri:'Modéré-élevé',rc:'text-orange-600 bg-orange-100',mx:null,d:'MSCI World. Aucun plafond.',p:['Illimité','Liquide','Diversifié','0.1%'],c:['Pas fiscal','Volatilité','Imposable'],lv:'500/mois à 7% = ~121k en 10 ans.'},
  {n:'3A Compte',r:.015,ri:'Très faible',rc:'text-emerald-600 bg-emerald-100',mx:7056,d:'Déductible. Garanti mais bloqué.',p:['Impôts réduits','Garanti','Discipline'],c:['Bloqué','Faible','Plafonné'],lv:'Taux 30% → 7056 = ~2100 économisés.'},
  {n:'Compte Épargne',r:.0075,ri:'Aucun',rc:'text-emerald-600 bg-emerald-100',mx:null,d:'Sûr mais < inflation.',p:['Garanti','Liquide','Simple'],c:['Nul','Perd valeur','Aucun avantage'],lv:'Aucun levier.'},
];
const AM=[
{id:'money',title:"Comprendre l'argent",icon:'Lightbulb',color:'amber',lessons:[
{id:'l1',title:"Qu'est-ce que l'argent?",free:true,dur:'4 min',content:"L'argent n'est pas une fin — c'est un outil de mesure.\n\nL'inflation: 100 CHF → ~85 CHF dans 10 ans (1.5%/an). Ne rien faire = perdre.",quiz:{q:"Inflation 2%/an, 1000 dans 10 ans ≈?",o:['~820','~980','~1000','~900'],c:0}},
{id:'l2',title:"Pièges psychologiques",free:true,dur:'5 min',content:"Dopamine = ANTICIPATION, pas possession.\n\n3 biais: 1. Ancrage (299→149) 2. Troupeau (iPhone Pro) 3. Gratification immédiate\n\nSolution: Règle 48h. 70% d'envies disparaissent.",quiz:{q:"Biais d'achat 'soldé' inutile?",o:["Ancrage","Aversion risque","Survie","Dunning-Kruger"],c:0}},
{id:'l3',title:"Actif vs Passif",free:false,dur:'5 min',content:"ACTIF = revenus (loyer, dividendes). PASSIF = coûts (leasing, crédit).\n\nVoiture: -15-20%/an. Règle: >500 CHF → valeur dans 5 ans?",quiz:{q:"Lequel est un actif?",o:["Voiture","ETF dividendes","TV 4K","Baskets"],c:1}},
{id:'l4',title:"Illusion du brut",free:false,dur:'4 min',content:"6k brut → AVS -318, LPP -420, Chômage -66 → 5196\n→ Impôts -624 → LAMal -350 → RÉEL: ~4222 CHF (30% de moins)",quiz:{q:"% du brut en charges?",o:['~10%','~20%','~30%','~50%'],c:2}},
]},
{id:'fortress',title:"Forteresse financière",icon:'Shield',color:'emerald',lessons:[
{id:'l5',title:"Fonds d'urgence",free:true,dur:'4 min',content:"AVANT d'investir: fonds d'urgence. 3-6 mois charges (~8-15k). Compte SÉPARÉ. UNIQUEMENT urgences.",quiz:{q:"Mois de charges pour urgence?",o:['1','3 à 6','12','24'],c:1}},
{id:'l6',title:"Règle 50/30/20",free:true,dur:'4 min',content:"50% BESOINS (loyer, LAMal)\n30% ENVIES (restos, shopping)\n20% AVENIR (épargne, 3A)\n\nSi loyer = 30% → adaptez: 60/20/20.",quiz:{q:"Part épargne?",o:['5%','10%','20%','50%'],c:2}},
{id:'l7',title:"Charges invisibles",free:false,dur:'5 min',content:"1. Abos oubliés: 150/mois = 1800/an\n2. Frais bancaires: 5-15/mois\n3. Assurances en double\n4. Franchise LAMal: 300→2500 = ~200/mois\n5. Leasing: 400×48 = 19200 pour rien",quiz:{q:"Franchise 300→2500 économise ~?",o:['20/mois','50/mois','200/mois','500/mois'],c:2}},
]},
{id:'invest',title:"Faire travailler l'argent",icon:'TrendingUp',color:'indigo',lessons:[
{id:'l8',title:"Intérêts composés",free:false,dur:'5 min',content:"Sans: 500/mois × 30 ans = 180k\nAvec 5%: → ~416k\nDifférence: 236k. Le secret: le TEMPS.",quiz:{q:"500/mois à 5% × 30 ans ≈?",o:['180k','250k','416k','1M'],c:2}},
{id:'l9',title:"3ème Pilier A",free:false,dur:'6 min',content:"1. Taux 30% → 7056 = ~2100 d'impôts en moins\n2. Compte (~1.5%) ou Titres (~5%)\n3. Retrait: résidence, départ CH, indépendance\n4. Astuce: 5 comptes 3A → étaler retraits\n\nPlafond: 7056/an (salariés).",quiz:{q:"Plafond 3A salarié:",o:['5000','7056','10000','35280'],c:1}},
{id:'l10',title:"ETF simplement",free:false,dur:'5 min',content:"ETF = 1500+ entreprises en 1 achat.\n• Frais 0.1-0.3%/an\n• ~7%/an sur 30+ ans\n• Dès 1 CHF\n\nOù: VIAC, Finpension (3A), IBKR (libre).\nRègle: RÉGULIÈREMENT, jamais chronométrer.",quiz:{q:"ETF MSCI World ≈ combien d'entreprises?",o:['50','500','1500+','10k'],c:2}},
]},
{id:'rescue',title:"Anti-Noyade",icon:'Heart',color:'rose',lessons:[
{id:'l14',title:"Mois Rouge",free:true,dur:'5 min',content:"1. STOP dépenses non-essentielles\n2. INVENTAIRE rentrées\n3. PRIORITÉ: Loyer → LAMal → Alimentation\n4. NÉGOCIEZ avant échéance (90% acceptent)\n5. PLAN: 3 dépenses à supprimer",quiz:{q:"1ère chose mois rouge?",o:['Crédit','Geler dépenses','Ignorer','Vendre'],c:1}},
{id:'l15',title:"7 pièges suisses",free:false,dur:'6 min',content:"1. LEASING 19k pour rien\n2. ABOS 1800/an\n3. FRANCHISE trop basse\n4. CRÉDIT CONSO: JAMAIS (10-15%)\n5. COMPARAISON SOCIALE\n6. LIFESTYLE INFLATION\n7. PAS DE 3A = 2100/an perdus",quiz:{q:"Produit à JAMAIS utiliser?",o:['ETF','Crédit conso','3A','Épargne'],c:1}},
{id:'l16',title:"Reset 90 jours",free:false,dur:'5 min',content:"M1 AUDIT: Listez tout, supprimez 3, compte séparé.\nM2 DISCIPLINE: 20% le jour du salaire, cash variable, négociez.\nM3 ACCÉLÉRATION: Vendez (2-5k), side-income, 1er ETF.",quiz:{q:"1er geste Reset?",o:['Investir','Audit','Prêt','Déménager'],c:1}},
]},
{id:'advanced',title:"Stratégies avancées",icon:'Crown',color:'amber',lessons:[
{id:'l12',title:"Optimisation fiscale",free:false,dur:'6 min',content:"Déductions: 1. 3A 7056 2. Rachats LPP 3. Formation 4. Transport 5. Repas pro 6. Dons (20%) 7. Maladie >5% 8. Hypothèque\n\nAstuce: proche d'un seuil → rachat LPP.",quiz:{q:"Rachats LPP sont...",o:['Impossibles','Déductibles','Réservés riches','Max 1k'],c:1}},
]},
];
const APR=[
{title:"TVA 8.1%",icon:'Landmark',color:'rose',content:"Dès 100k CA. TVA encaissée = argent Confédération.\nMéthode TDFN si CA < 5M."},
{title:"Piège AVS",icon:'Shield',color:'indigo',content:"RI: ~10% sur bénéfice. Régularisation 2 ans tard.\nProvisionner 10% en temps réel."},
{title:"Frais Représentation",icon:'Coffee',color:'amber',content:"Repas: NOM + MOTIF au dos.\nVéhicule privé: 0.70 CHF/km."},
{title:"Amortissements",icon:'TrendingUp',color:'emerald',content:"Achat >1k → amortissement 20-40%/an.\nFin d'année: provisions ou achats anticipés."},
];
export default function App(){
// AUTH STATE
const [user,setUser]=useState(null);
const [authLoading,setAuthLoading]=useState(true);
const [authView,setAuthView]=useState('login'); // login | signup | forgot
const [authEmail,setAuthEmail]=useState('');
const [authPw,setAuthPw]=useState('');
const [authErr,setAuthErr]=useState('');
const [showPw,setShowPw]=useState(false);

// APP STATE
const [logged,setLogged]=useState(false),[mode,setMode]=useState(null),[plan,setPlan]=useState('free'),[dk,setDk]=useState(false),[coName]=useState('Mon Entreprise Sàrl');
const [sal,setSal]=useState(0),[salSrc,setSalSrc]=useState('Salaire Principal'),[ePriv,setEPriv]=useState(DE),[chk,setChk]=useState([]);
const [ePro,setEPro]=useState(DP),[txs,setTxs]=useState([]),[goals,setGoals]=useState([]),[selG,setSelG]=useState(null),[docs,setDocs]=useState([]);
const [vw,setVw]=useState('dashboard'),[mdl,setMdl]=useState(null);
const [tSal,setTSal]=useState(''),[tSrc,setTSrc]=useState('');
const [txF,setTxF]=useState({type:'IN',amount:'',label:'',status:'PENDING',cat:EC[0]});
const [gF,setGF]=useState({l:'',t:'',s:0,m:'',cl:''}),[editG,setEditG]=useState(null),[txFi,setTxFi]=useState('ALL');
const [scanning,setScanning]=useState(false),[scanR,setScanR]=useState(null);
const [aL,setAL]=useState(null),[done,setDone]=useState([]),[qA,setQA]=useState(null),[qS,setQS]=useState(false),[xp,setXp]=useState(0),[streak,setStreak]=useState(0);
const [aiMsgs,setAiMsgs]=useState([]),[aiIn,setAiIn]=useState(''),[aiLoad,setAiLoad]=useState(false),[sPD,setSPD]=useState(null);
const [aiCount,setAiCount]=useState(0); // daily AI message counter for free plan
const cE=mode==='private'?ePriv:ePro,sE=mode==='private'?setEPriv:setEPro;
const pm=plan==='premium',ac=mode==='pro'?'indigo':'emerald';

// FREE PLAN LIMITS
const MAX_FREE_EXPENSES = 3;
const MAX_FREE_GOALS = 1;
const MAX_FREE_AI = 0; // Coach IA = premium only

// ═══ AUTH EFFECT ═══
useEffect(()=>{
  const checkUser = async ()=>{
    const u = await auth.getUser();
    if(u){
      setUser(u);
      const p = await db.getProfile(u.id);
      if(p){
        setPlan(p.plan||'free');
        setMode(p.mode||null);
        setSal(p.salary||0);
        setSalSrc(p.salary_source||'Salaire Principal');
        setDk(p.dark_mode||false);
        // Don't auto-enter app — show mode selection each time
      }
      // Load academy progress
      const prog = await db.getProgress(u.id);
      if(prog){ setDone(prog.completed_lessons||[]); setXp(prog.xp||0); setStreak(prog.streak||0); }
    }
    setAuthLoading(false);
  };
  checkUser();
  const { data:listener } = auth.onAuthChange((ev,session)=>{
    if(ev==='SIGNED_OUT'){ setUser(null); setLogged(false); setPlan('free'); setMode(null); }
  });
  // Check for Stripe success
  const params = new URLSearchParams(window.location.search);
  if(params.get('success')==='true'){
    setTimeout(async()=>{
      const u = await auth.getUser();
      if(u){ const p = await db.getProfile(u.id); if(p) setPlan(p.plan||'premium'); }
    }, 2000);
    window.history.replaceState({}, '', '/');
  }
  return ()=>{ listener?.subscription?.unsubscribe(); };
},[]);

// ═══ AUTH HANDLERS ═══
const handleSignUp = async()=>{
  setAuthErr('');
  if(!authEmail||!authPw) return setAuthErr('Email et mot de passe requis');
  if(authPw.length<6) return setAuthErr('Mot de passe: 6 caractères minimum');
  const {data,error} = await auth.signUp(authEmail, authPw);
  if(error) return setAuthErr(error.message);
  if(data?.user){
    setUser(data.user);
    setAuthErr('');
    // Don't set logged yet, user needs to choose mode
  }
};
const handleSignIn = async()=>{
  setAuthErr('');
  if(!authEmail||!authPw) return setAuthErr('Email et mot de passe requis');
  const {data,error} = await auth.signIn(authEmail, authPw);
  if(error) return setAuthErr(error.message==='Invalid login credentials'?'Email ou mot de passe incorrect':error.message);
  if(data?.user){
    setUser(data.user);
    const p = await db.getProfile(data.user.id);
    if(p?.mode){ setPlan(p.plan||'free'); setSal(p.salary||0); }
    // Don't auto-set mode — let user choose each time
  }
};
const handleSignOut = async()=>{
  await auth.signOut();
  setUser(null); setLogged(false); setMode(null); setPlan('free');
  setAuthEmail(''); setAuthPw(''); setAuthErr('');
};

// ═══ MODE SELECTION (after auth) ═══
const selectMode = async(m)=>{
  setMode(m);
  setVw(m==='pro'?'pro_dashboard':'dashboard');
  setLogged(true);
  if(user) await db.updateProfile(user.id, {mode:m});
  if(m==='private') setTimeout(openSM, 300);
};

// ═══ STRIPE CHECKOUT ═══
const handleUpgrade = async()=>{
  if(!user) return;
  try{
    const res = await fetch('/api/stripe/checkout',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ userId:user.id, email:user.email, mode })
    });
    const {url,error} = await res.json();
    if(url) window.location.href = url;
    else alert(error||'Erreur de paiement');
  }catch{ alert('Erreur de connexion au service de paiement'); }
};

// ═══ FINANCE ENGINE ═══
const fin=useMemo(()=>{
  let rem=0,sav=0,free=0,mC=0,tCA=0,eCA=0,fE=0,vP=0,vPe=0,tva=0,avs=0,imp=0;
  let td={ca:0,cats:{},fixed:0,ebit:0};
  if(mode==='private'){const tE=cE.reduce((a,e)=>a+(e.amount||0),0);rem=Math.max(0,sal-tE);sav=rem*.2;free=Math.max(0,rem-sav);mC=sav;}
  else if(mode==='pro'){txs.forEach(t=>{const a=parseFloat(t.amount||0);if(t.type==='IN'){t.status==='PAID'?tCA+=a:eCA+=a}else{t.status==='PAID'?vP+=a:vPe+=a;const c=t.cat||'Divers';td.cats[c]=(td.cats[c]||0)+a}});fE=cE.reduce((a,e)=>a+(e.amount||0),0);tva=tCA*.081;const nP=Math.max(0,(tCA-tva)-fE-vP);avs=nP*.1;imp=nP*.15;rem=Math.max(0,tCA-(tva+avs+imp)-fE-vP);sav=rem*.3;td.ca=tCA+eCA;td.fixed=fE;td.ebit=(tCA+eCA)-(fE+vP+vPe);}
  return{rem,sav,free,mC,tCA,eCA,fE,vP,vPe,tva,avs,imp,td};
},[sal,mode,cE,txs]);

const gPr=useCallback(g=>{
  const tgt=parseFloat(g.t)||0,sv=parseFloat(g.s)||0,r=Math.max(0,tgt-sv),mo=parseFloat(g.m)||fin.mC;
  if(mo<=0||r<=0)return{ms:0,ps:[]};const ms=Math.ceil(r/mo);
  const ps=IP.map(p=>{const rv=p.r/12;let m;if(rv===0)m=ms;else{const v=(r*rv)/mo+1;m=v<=0?ms:Math.ceil(Math.log(v)/Math.log(1+rv));}m=Math.max(1,m);const inv=mo*m;const tot=rv>0?mo*((Math.pow(1+rv,m)-1)/rv):inv;return{...p,ms:m,yrs:(m/12).toFixed(1),inv,tot,gains:tot-inv,saved:Math.max(0,ms-m)};});
  return{ms,ps,mo,r};
},[fin.mC]);

// ═══ AI (with daily limit for free) ═══
const sendAi=async()=>{if(!aiIn.trim())return;
  if(!pm && aiCount>=MAX_FREE_AI){setMdl('upgrade');return;}
  const u=aiIn.trim();setAiMsgs(p=>[...p,{r:'u',t:u}]);setAiIn('');setAiLoad(true);
  const ctx=mode==='private'?`Salaire:${sal},Charges:${cE.reduce((a,e)=>a+e.amount,0)},Épargne:${fin.mC.toFixed(0)}`:`CA:${fin.tCA},Charges:${fin.fE+fin.vP}`;
  try{const r=await fetch("/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:u,context:ctx,mode})});const d=await r.json();setAiMsgs(p=>[...p,{r:'a',t:d.response||"Erreur."}]);if(!pm)setAiCount(c=>c+1);}catch{setAiMsgs(p=>[...p,{r:'a',t:"Erreur de connexion."}]);}setAiLoad(false);};

// ═══ ACTIONS ═══
const openSM=()=>{setTSal(sal>0?sal.toString():'');setTSrc(salSrc);setMdl('sal');};
const saveSM=()=>{const s=parseFloat(tSal)||0;setSal(s);setSalSrc(tSrc||'Revenu');setMdl(null);if(user)db.updateProfile(user.id,{salary:s,salary_source:tSrc||'Revenu'});};
const saveTx=()=>{if(!txF.amount||!txF.label)return;const t={id:Date.now().toString(),...txF,amount:parseFloat(txF.amount),date:new Date().toISOString().split('T')[0]};setTxs([t,...txs]);setMdl(null);setTxF({type:'IN',amount:'',label:'',status:'PENDING',cat:EC[0]});};
const tTx=id=>setTxs(txs.map(t=>t.id===id?{...t,status:t.status==='PAID'?'PENDING':'PAID'}:t));
const saveG=()=>{
  if(!pm && goals.length>=MAX_FREE_GOALS && editG===null){setMdl('upgrade');return;}
  const pr=GP.find(p=>p.l===gF.l);const g={id:Date.now().toString(),l:gF.cl||gF.l,i:pr?.i||'Target',t:parseFloat(gF.t)||10000,s:parseFloat(gF.s)||0,m:gF.m?parseFloat(gF.m):''};if(editG!==null){setGoals(p=>p.map((x,i)=>i===editG?{...x,...g,id:x.id}:x));setEditG(null);}else setGoals([...goals,g]);setMdl(null);setGF({l:'',t:'',s:0,m:'',cl:''});};
const doScan=()=>{setScanning(true);setTimeout(()=>{setScanR({a:'127.50',l:'Restaurant Le Comptoir — Client',d:new Date().toISOString().split('T')[0],cat:'Repas & Représentation'});setScanning(false);},2000);};
const classDoc=type=>{if(!scanR)return;setDocs([{id:Date.now().toString(),...scanR,type,date:scanR.d},...docs]);if(type!=='JUSTIFICATIF')setTxs([{id:(Date.now()+1).toString(),type:type==='CLIENT'?'IN':'OUT',amount:parseFloat(scanR.a),label:scanR.l,date:scanR.d,status:'PAID',cat:type==='FOURNISSEUR'?scanR.cat:null},...txs]);setScanR(null);};
const openL=l=>{if(!l.free&&!pm){setMdl('upgrade');return;}setAL(l);setQA(null);setQS(false);setMdl('lesson');};
const doneL=()=>{
  const newDone = done.includes(aL.id)?done:[...done,aL.id];
  const newXp = done.includes(aL.id)?xp:xp+25;
  const newStreak = done.includes(aL.id)?streak:streak+1;
  setDone(newDone);setXp(newXp);setStreak(newStreak);setMdl(null);
  if(user)db.upsertProgress({user_id:user.id,completed_lessons:newDone,xp:newXp,streak:newStreak,updated_at:new Date().toISOString()});
};
const canAddExpense = pm || cE.length < MAX_FREE_EXPENSES;
const fTx=txs.filter(t=>txFi==='ALL'?true:txFi==='PENDING'?t.status==='PENDING':t.type===txFi);
const tL=AM.reduce((a,m)=>a+m.lessons.length,0);
const tc={bg:dk?'bg-zinc-950':'bg-stone-50',cd:dk?'bg-zinc-900':'bg-white',bd:dk?'border-zinc-800':'border-stone-200',tx:dk?'text-zinc-100':'text-stone-900',mt:dk?'text-zinc-500':'text-stone-500',inp:dk?'bg-zinc-800 border-zinc-700 text-white':'bg-stone-50 border-stone-200 text-stone-900',sf:dk?'bg-zinc-800':'bg-stone-100',hv:dk?'hover:bg-zinc-800':'hover:bg-stone-100'};

// ═══ AUTH LOADING ═══
if(authLoading) return(
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="text-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/><p className="text-stone-500 font-bold text-sm">Chargement...</p></div>
  </div>
);

// ═══ AUTH SCREEN ═══
if(!user) return(
  <div className={`min-h-screen flex items-center justify-center p-4 ${tc.bg}`}>
    <div className="max-w-sm w-full">
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-black italic tracking-tighter mb-2 ${tc.tx}`}>FatiaBill<span className="text-emerald-500">.</span></h1>
        <p className={`text-sm ${tc.mt}`}>Copilote financier suisse</p>
      </div>
      <div className={`p-6 rounded-3xl border ${tc.cd} ${tc.bd} shadow-xl`}>
        <h2 className={`text-lg font-black mb-4 ${tc.tx}`}>{authView==='login'?'Connexion':'Créer un compte'}</h2>
        {authErr&&<div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">{authErr}</div>}
        <div className="space-y-3">
          <div><label className="text-[8px] font-black uppercase text-stone-400">Email</label><div className="relative"><Mail size={16} className="absolute left-3 top-3 text-stone-400"/><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="votre@email.ch" className={`w-full border rounded-xl p-2.5 pl-10 text-sm font-medium outline-none ${tc.inp} focus:border-emerald-500`}/></div></div>
          <div><label className="text-[8px] font-black uppercase text-stone-400">Mot de passe</label><div className="relative"><Lock size={16} className="absolute left-3 top-3 text-stone-400"/><input type={showPw?"text":"password"} value={authPw} onChange={e=>setAuthPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(authView==='login'?handleSignIn():handleSignUp())} placeholder="••••••" className={`w-full border rounded-xl p-2.5 pl-10 pr-10 text-sm font-medium outline-none ${tc.inp} focus:border-emerald-500`}/><button onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-3 text-stone-400">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
          <button onClick={authView==='login'?handleSignIn:handleSignUp} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-colors">{authView==='login'?'Se connecter':'Créer mon compte'}</button>
        </div>
        <div className="mt-4 text-center">
          {authView==='login'?<p className={`text-xs ${tc.mt}`}>Pas encore de compte ? <button onClick={()=>{setAuthView('signup');setAuthErr('');}} className="text-emerald-600 font-bold underline">Inscription</button></p>
          :<p className={`text-xs ${tc.mt}`}>Déjà un compte ? <button onClick={()=>{setAuthView('login');setAuthErr('');}} className="text-emerald-600 font-bold underline">Connexion</button></p>}
        </div>
      </div>
    </div>
  </div>
);

// ═══ MODE SELECTION ═══
if(!mode) return(
  <div className={`min-h-screen flex items-center justify-center p-4 ${tc.bg}`}>
    <button onClick={()=>setDk(!dk)} className={`absolute top-4 right-4 p-3 rounded-full z-10 ${dk?'bg-zinc-800 text-yellow-400':'bg-white text-stone-800 shadow-md'}`}>{dk?<Sun size={18}/>:<Moon size={18}/>}</button>
    <div className="max-w-5xl w-full">
      <div className="text-center mb-10"><h1 className={`text-5xl font-black italic tracking-tighter mb-2 ${tc.tx}`}>FatiaBill<span className="text-emerald-500">.</span></h1><p className={`text-sm ${tc.mt}`}>Bienvenue {user?.email?.split('@')[0]} ! Choisissez votre mode.</p></div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`p-8 rounded-3xl border-2 cursor-pointer group ${dk?'bg-zinc-900 border-zinc-800 hover:border-emerald-500':'bg-white border-stone-100 hover:border-emerald-500 shadow-xl'}`} onClick={()=>selectMode('private')}>
          <div className="flex items-center justify-between mb-5"><div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><User size={26}/></div><div className="text-right"><div className={`text-xl font-black ${tc.tx}`}>Gratuit</div><span className={`text-[9px] font-bold ${tc.mt}`}>Premium 9.-/mois</span></div></div>
          <h2 className={`text-2xl font-black mb-2 ${tc.tx}`}>Employé / Privé</h2>
          <p className={`${tc.mt} text-sm mb-5`}>Budget, épargne, Académie, coaching IA.</p>
          <button className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black">Démarrer Privé</button>
        </div>
        <div className={`p-8 rounded-3xl border-2 cursor-pointer group relative ${dk?'bg-indigo-950/50 border-indigo-900 hover:border-indigo-500':'bg-stone-900 border-stone-900 hover:border-indigo-500 shadow-xl'}`} onClick={()=>selectMode('pro')}>
          <div className="flex items-center justify-between mb-5"><div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Briefcase size={26}/></div><div className="text-right"><div className="text-xl font-black text-white">19.-<span className="text-sm text-stone-400">/mois</span></div></div></div>
          <div className="absolute top-5 right-5 bg-indigo-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Expert</div>
          <h2 className="text-2xl font-black mb-2 text-white">Indépendant / Sàrl</h2>
          <p className="text-stone-400 text-sm mb-5">Trésorerie, TVA, AVS, scanner, fiscal.</p>
          <button className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black">Démarrer Pro</button>
        </div>
      </div>
    </div>
  </div>
);
// MAIN APP
const NB=({k,icon:Ic,l,sp})=><button onClick={()=>setVw(k)} className={`flex-1 min-w-[60px] py-2 rounded-xl font-black text-[9px] uppercase flex flex-col items-center justify-center gap-0.5 transition-all ${vw===k?(sp?`bg-${ac}-500/10 text-${ac}-500`:(dk?'bg-zinc-800 text-white':'bg-white text-stone-900 shadow-sm')):tc.mt}`}><Ic size={13}/></button>;
return(
<div className={`min-h-screen font-sans pb-20 transition-colors ${tc.bg} ${tc.tx}`}>
<nav className={`sticky top-0 z-30 border-b backdrop-blur-xl ${dk?'bg-zinc-950/80 border-zinc-800':'bg-white/80 border-stone-200'}`}>
  <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
    <div className="flex items-center gap-2"><div className={`p-1.5 rounded-xl text-white bg-${ac}-600`}>{mode==='pro'?<Landmark size={15}/>:<Zap size={15}/>}</div><span className={`font-black text-lg tracking-tighter`}>FatiaBill<span className={`text-${ac}-500`}>.</span></span></div>
    <div className="flex items-center gap-1.5">
      {mode==='private'&&xp>0&&<div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${dk?'bg-amber-900/30 text-amber-400':'bg-amber-50 text-amber-700'}`}><Flame size={12}/>{xp}{streak>=3&&<span>🔥{streak}</span>}</div>}
      {!pm&&<button onClick={()=>setMdl('upgrade')} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Crown size={11}/>Pro</button>}
      {pm&&<span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${dk?'bg-emerald-900/30 text-emerald-400':'bg-emerald-50 text-emerald-700'}`}><Crown size={11}/>PRO</span>}
      <button onClick={()=>setDk(!dk)} className={`p-2 rounded-full ${dk?'text-yellow-400 bg-zinc-900':'text-stone-500 bg-stone-100'}`}>{dk?<Sun size={15}/>:<Moon size={15}/>}</button>
      <button onClick={handleSignOut} className={`p-2 rounded-full ${dk?'text-zinc-500 bg-zinc-900':'text-stone-400 bg-stone-100'}`}><LogOut size={15}/></button>
    </div>
  </div>
</nav>
<main className="max-w-4xl mx-auto p-4 space-y-5">
<div className={`flex flex-wrap gap-1 p-1 rounded-2xl ${dk?'bg-zinc-900':'bg-stone-200/80'}`}>
  {mode==='private'?<><NB k="dashboard" icon={CheckSquare} l="B"/><NB k="savings" icon={Target} l="E"/><NB k="academy" icon={GraduationCap} l="A" sp/><NB k="ai" icon={MessageCircle} l="IA" sp/><NB k="setup" icon={Settings} l="C"/></>
  :<><NB k="pro_dashboard" icon={LayoutDashboard} l="C"/><NB k="transactions" icon={Receipt} l="J"/><NB k="scanner" icon={Camera} l="S"/><NB k="tax_report" icon={FileSignature} l="I"/><NB k="ai_pro" icon={MessageCircle} l="IA" sp/><NB k="academy_pro" icon={BookOpen} l="G"/><NB k="setup" icon={Settings} l="C"/></>}
</div>

{/* PRIVÉ DASHBOARD */}
{mode==='private'&&vw==='dashboard'&&<div className="space-y-4 max-w-2xl mx-auto">
  <section className={`rounded-3xl p-6 relative overflow-hidden shadow-2xl ${dk?'bg-zinc-900 border border-zinc-800':'bg-stone-900 text-white'}`}>
    <div className="relative z-10 space-y-4">
      <div onClick={openSM} className={`p-3 rounded-2xl flex justify-between items-center cursor-pointer border ${dk?'bg-black/30 border-white/5':'bg-white/10 border-white/10'}`}><div><p className="text-[8px] font-black uppercase text-stone-400">{salSrc}</p><span className="text-lg font-black">{sal.toFixed(0)} <span className="text-xs text-stone-400">CHF</span></span></div><Edit3 size={14} className="text-stone-500"/></div>
      <div><p className="text-[8px] font-black uppercase text-emerald-400 mb-1">Argent de liberté</p><div className="flex items-baseline gap-1"><h2 className="text-5xl font-black tabular-nums tracking-tighter">{fin.free.toFixed(0)}</h2><span className="text-lg font-bold opacity-40">.-</span></div><p className="text-[9px] text-stone-400">Après charges + 20% épargne</p></div>
    </div>
    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500 blur-[80px] opacity-15 pointer-events-none"/>
  </section>
  <div className="space-y-2">
    <div className="flex justify-between items-center px-1"><h3 className="font-black text-sm">Factures du mois</h3><span className={`text-xs font-bold ${tc.mt}`}>{chk.length}/{cE.length}</span></div>
    {cE.map(e=>{const on=chk.includes(e.id),IC=gi(e.icon);return(
      <div key={e.id} onClick={()=>setChk(p=>on?p.filter(x=>x!==e.id):[...p,e.id])} className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between ${on?(dk?'border-emerald-500 bg-emerald-900/20':'border-stone-900 bg-white shadow-lg'):(dk?'border-zinc-800 bg-zinc-900/50':'border-transparent bg-white shadow-sm')}`}>
        <div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${on?'bg-emerald-600 text-white':(dk?'bg-zinc-800 text-zinc-500':'bg-stone-100 text-stone-400')}`}>{on?<CheckCircle2 size={18}/>:<IC size={18}/>}</div><div><p className={`font-bold text-sm ${on?'':tc.mt}`}>{e.label}</p><p className="text-[8px] font-bold text-stone-500 uppercase">{e.cat}</p></div></div>
        <p className={`font-black text-sm tabular-nums ${on?'':'text-stone-400'}`}>{e.amount.toFixed(0)}.-</p>
      </div>);})}
  </div>
</div>}

{/* SAVINGS */}
{mode==='private'&&vw==='savings'&&<div className="space-y-5 max-w-3xl mx-auto">
  <div className="flex justify-between items-center"><h3 className="font-black text-lg flex items-center gap-2"><Target className="text-emerald-500" size={20}/>Épargne</h3><button onClick={()=>{setEditG(null);setGF({l:'',t:'',s:0,m:'',cl:''});setMdl('goal');}} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2"><Plus size={16}/>Objectif</button></div>
  <div className={`p-4 rounded-2xl border flex items-center justify-between ${tc.cd} ${tc.bd}`}><div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Wallet size={18}/></div><div><p className="text-[8px] font-black uppercase text-stone-500">Capacité/mois (20%)</p><p className="font-black text-lg tabular-nums">{fin.mC.toFixed(0)} CHF</p></div></div>{sal===0&&<button onClick={openSM} className="text-xs font-bold text-emerald-600 underline">Salaire</button>}</div>
  {goals.length===0?<div className={`p-10 text-center rounded-3xl border border-dashed ${tc.bd} ${tc.mt}`}><Target size={36} className="mx-auto mb-2 opacity-20"/><p className="font-bold text-sm mb-4">Créez votre premier objectif</p><button onClick={()=>setMdl('goal')} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">Créer</button></div>
  :goals.map((g,idx)=>{const IC=gi(g.i),pr=gPr(g),pct=g.t>0?Math.min(100,(g.s/g.t)*100):0,op=selG===idx;return(
    <div key={g.id} className={`rounded-2xl border overflow-hidden ${tc.cd} ${tc.bd}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><IC size={20}/></div><div><h4 className="font-black text-sm">{g.l}</h4><p className={`text-[10px] ${tc.mt}`}>Cible: {g.t.toLocaleString('fr-CH')} CHF</p></div></div><div className="flex gap-1"><button onClick={()=>{setGF({l:g.l,t:g.t.toString(),s:g.s,m:g.m?.toString()||'',cl:''});setEditG(idx);setMdl('goal');}} className={`p-1.5 rounded-lg ${tc.hv}`}><Edit3 size={13} className="text-stone-400"/></button><button onClick={()=>setGoals(p=>p.filter((_,i)=>i!==idx))} className={`p-1.5 rounded-lg ${tc.hv}`}><Trash2 size={13} className="text-stone-400"/></button></div></div>
        <div className="mb-2"><div className="flex justify-between text-[9px] font-bold mb-1"><span>{g.s.toLocaleString('fr-CH')} CHF</span><span className={tc.mt}>{pct.toFixed(0)}%</span></div><div className={`w-full h-2 rounded-full overflow-hidden ${tc.sf}`}><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{width:`${pct}%`}}/></div></div>
        {pr.ms>0&&<div className={`grid grid-cols-3 gap-2 mt-2 p-2.5 rounded-xl text-center ${tc.sf}`}><div><p className="text-[7px] font-black uppercase text-stone-400">Reste</p><p className="font-black text-xs tabular-nums">{pr.r?.toLocaleString('fr-CH')}</p></div><div><p className="text-[7px] font-black uppercase text-stone-400">/mois</p><p className="font-black text-xs tabular-nums">{pr.mo?.toFixed(0)}</p></div><div><p className="text-[7px] font-black uppercase text-stone-400">Sans invest.</p><p className="font-black text-xs tabular-nums">{(pr.ms/12).toFixed(1)} ans</p></div></div>}
        <button onClick={()=>setSelG(op?null:idx)} className={`w-full mt-2 py-2 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 ${op?'bg-emerald-600 text-white':`${tc.sf} ${tc.mt}`}`}><BarChart3 size={13}/>{op?'Masquer':'Stratégies'}<ChevronDown size={13} className={`transition-transform ${op?'rotate-180':''}`}/></button>
      </div>
      {op&&pr.ms>0&&<div className={`border-t ${tc.bd} p-4 space-y-3`}>
        <p className="flex items-center gap-2 font-black text-xs"><Sparkles size={14} className="text-amber-500"/>Véhicules d'investissement</p>
        {pr.ps.map((p,pi)=><div key={pi} className={`rounded-xl border p-3 cursor-pointer ${sPD===`${idx}-${pi}`?'ring-1 ring-emerald-500/30':''} ${tc.bd} ${tc.cd}`} onClick={()=>setSPD(sPD===`${idx}-${pi}`?null:`${idx}-${pi}`)}>
          <div className="flex items-start justify-between mb-1"><div><span className="font-bold text-xs">{p.n}</span><span className={`ml-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full ${p.rc}`}>{p.ri}</span></div><div className="text-right"><p className="font-black text-base tabular-nums text-emerald-500">{p.yrs} <span className="text-[10px]">ans</span></p>{p.saved>0&&<p className="text-[8px] font-bold text-emerald-600">{p.saved} mois gagnés</p>}</div></div>
          {p.gains>0&&<div className={`text-[9px] font-bold p-1.5 rounded-lg flex items-center gap-1 ${dk?'bg-emerald-900/20 text-emerald-400':'bg-emerald-50 text-emerald-700'}`}><ArrowUpRight size={11}/>+{p.gains.toFixed(0)} CHF composés</div>}
          {sPD===`${idx}-${pi}`&&<div className={`mt-2 pt-2 border-t ${tc.bd} space-y-2`}><p className={`text-[10px] ${tc.mt}`}>{p.d}</p>
            <div className="grid grid-cols-2 gap-2"><div className={`p-2 rounded-lg ${tc.sf}`}><p className="text-[8px] font-black text-emerald-500 mb-1">+</p>{p.p.map((x,i)=><div key={i} className="flex items-start gap-1 mb-0.5"><Check size={9} className="text-emerald-500 mt-0.5 shrink-0"/><span className="text-[9px]">{x}</span></div>)}</div><div className={`p-2 rounded-lg ${tc.sf}`}><p className="text-[8px] font-black text-rose-500 mb-1">−</p>{p.c.map((x,i)=><div key={i} className="flex items-start gap-1 mb-0.5"><AlertCircle size={9} className="text-rose-400 mt-0.5 shrink-0"/><span className="text-[9px]">{x}</span></div>)}</div></div>
            <div className={`p-2 rounded-lg border border-dashed ${dk?'border-amber-800 bg-amber-900/10':'border-amber-200 bg-amber-50'}`}><p className="text-[8px] font-black text-amber-600 flex items-center gap-1"><TrendingUp size={10}/>Levier</p><p className={`text-[10px] ${dk?'text-amber-200':'text-amber-800'}`}>{p.lv}</p></div>
          </div>}
        </div>)}
        <div className={`p-3 rounded-xl border ${dk?'border-emerald-800 bg-emerald-900/10':'border-emerald-200 bg-emerald-50'}`}><p className="flex items-center gap-1.5 font-black text-[10px] text-emerald-700 mb-1"><Star size={13}/>Conseil</p><p className={`text-[10px] ${dk?'text-emerald-200':'text-emerald-800'}`}>{pr.ms>24?'Horizon long: combinez 3A Titres + ETF.':pr.ms>12?'Horizon 1-2 ans: 3A compte pour sécurité + fiscal.':'Court terme: sécurité. Pas de risque marché.'}</p></div>
      </div>}
    </div>);})}
</div>}
{/* ACADÉMIE */}
{mode==='private'&&vw==='academy'&&<div className="space-y-5 max-w-3xl mx-auto">
  <div className="text-center mb-4"><div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2"><GraduationCap size={26}/></div><h3 className="font-black text-xl">Académie Financière</h3><p className={`text-xs ${tc.mt}`}>{tL} leçons · {done.length} faites · {xp} XP</p><div className={`w-full max-w-xs mx-auto h-2 rounded-full overflow-hidden mt-2 ${tc.sf}`}><div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{width:`${(done.length/tL)*100}%`}}/></div></div>
  {AM.map(mod=>{const MI=gi(mod.icon),cd=mod.lessons.filter(l=>done.includes(l.id)).length;return(
    <div key={mod.id} className={`rounded-2xl border overflow-hidden ${tc.cd} ${tc.bd}`}>
      <div className={`p-4 border-b ${tc.bd} flex items-center gap-3`}><div className={`p-2 rounded-xl bg-${mod.color}-500/10 text-${mod.color}-500`}><MI size={20}/></div><div className="flex-1"><h4 className="font-black text-xs uppercase">{mod.title}</h4><p className={`text-[9px] ${tc.mt}`}>{cd}/{mod.lessons.length}</p></div>{cd===mod.lessons.length&&<Trophy size={18} className="text-amber-500"/>}</div>
      <div className={`divide-y ${dk?'divide-zinc-800':'divide-stone-100'}`}>{mod.lessons.map(l=>{const dn=done.includes(l.id),lk=!l.free&&!pm;return(
        <button key={l.id} onClick={()=>openL(l)} className={`w-full p-3 flex items-center gap-3 text-left ${tc.hv} ${lk?'opacity-50':''}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dn?'bg-emerald-500 text-white':lk?tc.sf:`bg-${mod.color}-500/10 text-${mod.color}-500`}`}>{dn?<Check size={14}/>:lk?<Lock size={12}/>:<Play size={12}/>}</div>
          <div className="flex-1 min-w-0"><p className={`font-bold text-xs truncate ${dn?'line-through opacity-50':''}`}>{l.title}</p><p className={`text-[9px] ${tc.mt}`}>{l.dur}{lk?' · Premium':''}</p></div>
          {dn&&<span className="text-[8px] font-bold text-emerald-500">+25</span>}<ChevronRight size={14} className={tc.mt}/>
        </button>);})}</div>
    </div>);})}
</div>}

{/* COACH IA */}
{(mode==='private'&&vw==='ai')||(mode==='pro'&&vw==='ai_pro')? <div className="max-w-2xl mx-auto space-y-4">
  {!pm ? <div className={`text-center py-16 ${tc.mt}`}>
    <Lock size={40} className="mx-auto mb-4 opacity-20"/>
    <h3 className={`font-black text-lg mb-2 ${tc.tx}`}>{mode==='pro'?'Coach Business IA':'Coach Financier IA'}</h3>
    <p className={`text-sm mb-6 max-w-sm mx-auto ${tc.mt}`}>{mode==='pro'?'Un conseiller IA spécialisé en création d\'entreprise, TVA, AVS, optimisation fiscale et stratégie business en Suisse.':'Un conseiller IA expert en budget, épargne, 3ème pilier, investissement et fiscalité suisse.'}</p>
    <button onClick={()=>setMdl('upgrade')} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl flex items-center gap-2 mx-auto"><Crown size={16}/> Débloquer avec Premium</button>
  </div>
  : <>
  <div className="text-center mb-3"><div className={`w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center text-white shadow-lg ${mode==='pro'?'bg-gradient-to-br from-indigo-500 to-purple-600':'bg-gradient-to-br from-emerald-500 to-teal-600'}`}><MessageCircle size={20}/></div><h3 className="font-black text-lg">{mode==='pro'?'Coach Business IA':'Coach Financier IA'}</h3><p className={`text-[10px] ${tc.mt}`}>{mode==='pro'?'TVA · AVS · Stratégie · Entreprise':'Fiscalité · Épargne · Investissement'}</p></div>
  <div className={`rounded-2xl border ${tc.cd} ${tc.bd} overflow-hidden`} style={{minHeight:'380px'}}>
    <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
      {aiMsgs.length===0&&<div className={`text-center py-8 ${tc.mt}`}><Sparkles size={28} className="mx-auto mb-2 opacity-20"/><p className="font-bold text-xs mb-3">Essayez:</p><div className="space-y-1.5 max-w-xs mx-auto">{(mode==='pro'?["Comment structurer ma Sàrl?","Optimiser ma TVA trimestrielle?","Charges sociales indépendant?","Stratégie pricing pour mon service?"]:["Ouvrir un 3ème pilier?","Optimiser impôts Vaud?","ETF vs fonds actif?","Épargner pour immobilier?"]).map((q,i)=><button key={i} onClick={()=>setAiIn(q)} className={`w-full text-left p-2 rounded-xl text-[10px] font-medium border ${tc.bd} ${tc.hv}`}>{q}</button>)}</div></div>}
      {aiMsgs.map((m,i)=><div key={i} className={`flex ${m.r==='u'?'justify-end':'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${m.r==='u'?`${mode==='pro'?'bg-indigo-600':'bg-emerald-600'} text-white rounded-br-sm`:`${tc.sf} ${tc.tx} rounded-bl-sm`}`}>{m.t}</div></div>)}
      {aiLoad&&<div className="flex justify-start"><div className={`p-3 rounded-2xl ${tc.sf}`}><div className="flex gap-1">{[0,1,2].map(i=><div key={i} className={`w-1.5 h-1.5 ${mode==='pro'?'bg-indigo-500':'bg-emerald-500'} rounded-full animate-bounce`} style={{animationDelay:`${i*.15}s`}}/>)}</div></div></div>}
    </div>
    <div className={`p-3 border-t ${tc.bd} flex gap-2`}><input value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendAi()} placeholder={mode==='pro'?"Question business...":"Question financière..."} className={`flex-1 px-3 py-2 rounded-xl border outline-none text-xs ${tc.inp}`}/><button onClick={sendAi} disabled={aiLoad||!aiIn.trim()} className={`px-3 py-2 ${mode==='pro'?'bg-indigo-600':'bg-emerald-600'} text-white rounded-xl font-bold disabled:opacity-40`}><Send size={16}/></button></div>
  </div></>}
</div>:null}

{/* PRO DASHBOARD */}
{mode==='pro'&&vw==='pro_dashboard'&&<div className="space-y-5">
  <div className="grid md:grid-cols-2 gap-5">
    <section className={`rounded-3xl p-6 relative overflow-hidden shadow-2xl ${dk?'bg-zinc-900 border border-zinc-800':'bg-indigo-950 text-white'}`}><div className="relative z-10 space-y-4"><div className={`p-3 rounded-2xl flex justify-between items-center border ${dk?'bg-black/30 border-white/5':'bg-white/10 border-white/10'}`}><div><p className="text-[8px] font-black uppercase text-indigo-400">CA Encaissé</p><span className="text-lg font-black">{fin.tCA.toFixed(0)} CHF</span></div>{fin.eCA>0&&<div className="text-right"><p className="text-[7px] font-black text-stone-500">Débiteurs</p><span className="text-xs font-bold text-stone-300">+{fin.eCA.toFixed(0)}</span></div>}</div><div><p className="text-[8px] font-black uppercase text-emerald-400">Trésorerie</p><h2 className="text-4xl font-black tabular-nums tracking-tighter">{fin.rem.toFixed(0)}.-</h2></div></div><div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-500 blur-[80px] opacity-15 pointer-events-none"/></section>
    <div className={`p-5 rounded-3xl border ${tc.cd} ${tc.bd}`}><h3 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2"><Lock size={13}/>Provisions</h3>{[{l:'TVA 8.1%',v:fin.tva,c:'rose'},{l:'AVS 10%',v:fin.avs,c:'indigo'},{l:'Impôts 15%',v:fin.imp,c:'amber'}].map((x,i)=><div key={i} className="mb-3"><div className="flex justify-between text-[10px] font-bold mb-0.5"><span className="text-stone-500">{x.l}</span><span className={`text-${x.c}-500`}>{x.v.toFixed(0)}</span></div><div className={`w-full h-1.5 rounded-full ${tc.sf}`}><div className={`h-full bg-${x.c}-500 rounded-full`} style={{width:fin.tCA>0?'100%':'0%'}}/></div></div>)}</div>
  </div>
</div>}

{/* PRO TRANSACTIONS */}
{mode==='pro'&&vw==='transactions'&&<div className="space-y-4">
  <div className="flex justify-between items-center"><h3 className="font-black text-lg">Journal</h3><button onClick={()=>setMdl('tx')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2"><Plus size={16}/>Pièce</button></div>
  <div className={`flex gap-1 p-1 rounded-xl ${tc.cd} border ${tc.bd}`}>{[{k:'ALL',l:'Tout'},{k:'IN',l:'Recettes'},{k:'OUT',l:'Dépenses'},{k:'PENDING',l:'Attente'}].map(f=><button key={f.k} onClick={()=>setTxFi(f.k)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold ${txFi===f.k?'bg-stone-800 text-white':`text-stone-500 ${tc.hv}`}`}>{f.l}</button>)}</div>
  {fTx.length===0&&<div className={`p-8 text-center rounded-2xl border border-dashed ${tc.bd} ${tc.mt}`}><Receipt size={28} className="mx-auto mb-2 opacity-20"/><p className="font-bold text-xs">Vide</p></div>}
  {fTx.map(t=><div key={t.id} className={`p-3 flex items-center justify-between rounded-2xl border ${t.status==='PENDING'?(dk?'bg-amber-950/20 border-amber-900':'bg-amber-50/50 border-amber-200'):`${tc.cd} ${tc.bd}`}`}><div className="flex items-center gap-2.5"><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type==='IN'?'bg-emerald-500/10 text-emerald-500':'bg-rose-500/10 text-rose-500'}`}>{t.type==='IN'?<TrendingUp size={16}/>:<Receipt size={16}/>}</div><div><p className="font-bold text-xs">{t.label}</p><p className={`text-[8px] ${tc.mt}`}>{t.date}</p></div></div><div className="flex items-center gap-3"><p className={`font-black tabular-nums ${t.type==='IN'?'text-emerald-500':''}`}>{t.type==='IN'?'+':'-'}{parseFloat(t.amount).toFixed(0)}</p><div className="flex gap-1"><button onClick={()=>tTx(t.id)} className={`p-1 rounded-lg ${tc.sf}`}>{t.status==='PAID'?<Clock size={13}/>:<CheckCircle2 size={13}/>}</button><button onClick={()=>setTxs(txs.filter(x=>x.id!==t.id))} className="p-1 text-stone-400 hover:text-rose-500"><Trash2 size={13}/></button></div></div></div>)}
</div>}

{/* PRO SCANNER */}
{mode==='pro'&&vw==='scanner'&&<div className="space-y-5 max-w-2xl mx-auto">
  <div className="text-center"><div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2"><Camera size={26}/></div><h3 className="font-black text-lg">Scanner</h3></div>
  <button onClick={()=>{setScanR(null);doScan();}} disabled={scanning} className={`w-full py-10 border-2 border-dashed rounded-3xl flex flex-col items-center gap-2 ${scanning?'border-indigo-500':'hover:border-indigo-500'} ${tc.bd}`}>{scanning?<><Sparkles className="animate-spin text-indigo-500" size={28}/><span className="font-bold text-sm text-indigo-500">OCR...</span></>:<><Camera size={28} className={tc.mt}/><span className={`font-bold text-sm ${tc.mt}`}>Photographier un reçu</span></>}</button>
  {scanR&&<div className={`p-5 rounded-2xl border-2 border-indigo-500 ${tc.cd} space-y-4`}>
    <p className="font-black text-xs flex items-center gap-2"><Check size={16} className="text-emerald-500"/>Classez:</p>
    <div className={`p-3 rounded-xl ${tc.sf}`}><div className="flex justify-between text-xs mb-1"><span className={tc.mt}>Montant</span><span className="font-black">{scanR.a} CHF</span></div><div className="flex justify-between text-xs"><span className={tc.mt}>Libellé</span><span className="font-bold">{scanR.l}</span></div></div>
    <div className="grid grid-cols-3 gap-2">
      <button onClick={()=>classDoc('CLIENT')} className="py-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center gap-1"><TrendingUp size={22} className="text-emerald-600"/><span className="font-black text-[10px] text-emerald-700">CLIENT</span></button>
      <button onClick={()=>classDoc('FOURNISSEUR')} className="py-4 rounded-xl border-2 border-rose-500 bg-rose-50 flex flex-col items-center gap-1"><Receipt size={22} className="text-rose-600"/><span className="font-black text-[10px] text-rose-700">FOURNISSEUR</span></button>
      <button onClick={()=>classDoc('JUSTIFICATIF')} className="py-4 rounded-xl border-2 border-amber-500 bg-amber-50 flex flex-col items-center gap-1"><Archive size={22} className="text-amber-600"/><span className="font-black text-[10px] text-amber-700">ARCHIVE</span></button>
    </div>
  </div>}
  {docs.length>0&&<div className={`rounded-2xl border ${tc.cd} ${tc.bd}`}><div className={`p-3 border-b ${tc.bd}`}><h4 className="font-black text-xs flex items-center gap-2"><FolderOpen size={14}/>Archives ({docs.length})</h4></div>{docs.map(d=><div key={d.id} className={`p-2.5 flex items-center justify-between border-b ${tc.bd}`}><div className="flex items-center gap-2"><Tag size={12} className={d.type==='CLIENT'?'text-emerald-500':'text-rose-500'}/><span className="text-[10px] font-bold truncate max-w-48">{d.l}</span></div><span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${d.type==='CLIENT'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{d.type}</span></div>)}</div>}
</div>}

{/* PRO TAX */}
{mode==='pro'&&vw==='tax_report'&&<div className="space-y-4">
  <div className="flex justify-between items-center"><h3 className="font-black text-lg">Dossier Fiscal</h3><button onClick={()=>window.print()} className={`px-4 py-2 rounded-xl font-bold text-sm ${dk?'bg-zinc-100 text-zinc-900':'bg-stone-900 text-white'}`}><FileText size={15} className="inline mr-1"/>PDF</button></div>
  <div className={`p-6 rounded-3xl border ${tc.cd} ${tc.bd}`}>
    <div className="flex justify-between border-b-2 border-stone-800 pb-4 mb-4"><h1 className="text-xl font-black uppercase tracking-tighter">Compte de Résultat</h1><div className="text-right"><h2 className="font-black text-sm">{coName}</h2><p className="text-[9px] text-stone-500">{new Date().toLocaleDateString('fr-CH')}</p></div></div>
    <div className="space-y-4 text-xs">
      <div><h4 className="text-[10px] font-bold uppercase text-stone-400 mb-1 border-b border-stone-200 pb-1">Produits</h4><div className="flex justify-between py-1"><span>CA facturé</span><span className="font-bold tabular-nums">{fin.td.ca.toFixed(2)}</span></div></div>
      <div><h4 className="text-[10px] font-bold uppercase text-stone-400 mb-1 border-b border-stone-200 pb-1">Charges</h4>{cE.map(e=><div key={e.id} className="flex justify-between py-0.5"><span>{e.label}</span><span>-{e.amount.toFixed(2)}</span></div>)}{Object.entries(fin.td.cats).map(([c,a])=><div key={c} className="flex justify-between py-0.5"><span>{c}</span><span>-{a.toFixed(2)}</span></div>)}</div>
      <div className="pt-3 border-t-4 border-stone-900"><div className="flex justify-between"><span className="text-sm font-black uppercase">Résultat</span><span className="font-black text-lg tabular-nums">{fin.td.ebit.toFixed(2)} CHF</span></div></div>
    </div>
  </div>
</div>}

{/* PRO GUIDE */}
{mode==='pro'&&vw==='academy_pro'&&<div className="space-y-5"><div className="text-center mb-3"><div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2"><BookOpen size={26}/></div><h3 className="font-black text-lg">Guide Fédéral</h3></div><div className="grid md:grid-cols-2 gap-4">{APR.map((x,i)=>{const XI=gi(x.icon);return(<div key={i} className={`p-5 rounded-2xl border ${tc.cd} ${tc.bd}`}><div className="flex items-center gap-3 mb-3"><div className={`p-2.5 rounded-xl bg-${x.color}-500/10 text-${x.color}-500`}><XI size={22}/></div><h4 className="font-black text-xs uppercase leading-tight">{x.title}</h4></div><p className={`text-[10px] leading-relaxed whitespace-pre-line ${tc.mt}`}>{x.content}</p></div>);})}</div></div>}

{/* SETUP */}
{vw==='setup'&&<div className="space-y-4 max-w-2xl mx-auto">
  <div className="flex justify-between items-center"><h3 className="font-black text-lg">Charges Fixes</h3><button onClick={()=>sE([...cE,{id:Date.now().toString(),label:'Nouveau',amount:0,cat:'Autre',icon:'Receipt'}])} className={`p-2 rounded-xl text-white bg-${ac}-600`}><Plus size={16}/></button></div>
  {cE.map(e=><div key={e.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${tc.cd} ${tc.bd}`}><div className="flex-1 space-y-1.5"><input type="text" value={e.label} onChange={v=>sE(p=>p.map(x=>x.id===e.id?{...x,label:v.target.value}:x))} className={`w-full text-xs font-bold bg-transparent outline-none border-b pb-0.5 ${dk?'border-zinc-800':'border-stone-200'}`}/><div className="flex items-center gap-2"><input type="number" value={e.amount||''} onChange={v=>sE(p=>p.map(x=>x.id===e.id?{...x,amount:parseFloat(v.target.value)||0}:x))} className={`w-20 px-2 py-1 rounded-lg text-xs font-black ${tc.sf}`}/><span className="text-[9px] text-stone-500">CHF</span></div></div><button onClick={()=>sE(p=>p.filter(x=>x.id!==e.id))} className="p-1.5 text-stone-400 hover:text-rose-500"><Trash2 size={16}/></button></div>)}
</div>}

</main>

{/* MODALS */}
{mdl&&<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={()=>{if(mdl!=='lesson')setMdl(null);}}>
<div className={`w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl shadow-2xl ${tc.cd} border ${tc.bd}`} onClick={e=>e.stopPropagation()}>

{/* SALARY */}
{mdl==='sal'&&<><div className="bg-stone-950 text-white p-4 flex justify-between items-center"><h2 className="text-base font-black">Salaire</h2><button onClick={()=>setMdl(null)} className="bg-white/10 p-1.5 rounded-full"><X size={16}/></button></div><div className="p-4 space-y-3"><div><label className="text-[8px] font-black uppercase text-stone-400">Source</label><input type="text" value={tSrc} onChange={e=>setTSrc(e.target.value)} className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${tc.inp}`}/></div><div><label className="text-[8px] font-black uppercase text-stone-400">Brut CHF</label><input type="number" value={tSal} onChange={e=>setTSal(e.target.value)} className={`w-full border rounded-xl p-3 text-xl font-black outline-none mt-1 ${tc.inp}`}/></div><button onClick={saveSM} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl">Valider</button></div></>}

{/* TRANSACTION */}
{mdl==='tx'&&<><div className={`p-4 flex justify-between items-center border-b ${tc.bd}`}><h2 className="text-base font-black">Pièce</h2><button onClick={()=>setMdl(null)} className={`p-1.5 rounded-full ${tc.sf}`}><X size={16}/></button></div><div className="p-4 space-y-3">
  <div className={`flex gap-2 p-1 rounded-xl ${tc.sf}`}><button onClick={()=>setTxF({...txF,type:'IN'})} className={`flex-1 py-2 font-bold text-xs rounded-lg ${txF.type==='IN'?'bg-emerald-500 text-white':'text-stone-500'}`}>+Recette</button><button onClick={()=>setTxF({...txF,type:'OUT'})} className={`flex-1 py-2 font-bold text-xs rounded-lg ${txF.type==='OUT'?'bg-rose-500 text-white':'text-stone-500'}`}>-Dépense</button></div>
  <div><label className="text-[8px] font-black uppercase text-stone-400">CHF</label><input type="number" value={txF.amount} onChange={e=>setTxF({...txF,amount:e.target.value})} className={`w-full border rounded-xl p-3 text-xl font-black outline-none mt-1 ${tc.inp}`}/></div>
  <div><label className="text-[8px] font-black uppercase text-stone-400">Libellé</label><input type="text" value={txF.label} onChange={e=>setTxF({...txF,label:e.target.value})} className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${tc.inp}`}/></div>
  {txF.type==='OUT'&&<div><label className="text-[8px] font-black uppercase text-stone-400">Catégorie</label><select value={txF.cat} onChange={e=>setTxF({...txF,cat:e.target.value})} className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${tc.inp}`}>{EC.map(c=><option key={c}>{c}</option>)}</select></div>}
  <div className={`flex gap-2 ${tc.sf} p-1 rounded-xl`}><button onClick={()=>setTxF({...txF,status:'PAID'})} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${txF.status==='PAID'?'bg-emerald-500 text-white':'text-stone-500'}`}><CheckCircle2 size={14}/>Payé</button><button onClick={()=>setTxF({...txF,status:'PENDING'})} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${txF.status==='PENDING'?'bg-amber-500 text-white':'text-stone-500'}`}><Clock size={14}/>Attente</button></div>
  <button onClick={saveTx} className={`w-full py-3 text-white font-black rounded-xl ${txF.type==='IN'?'bg-emerald-600':'bg-rose-600'}`}>Ajouter</button>
</div></>}

{/* GOAL */}
{mdl==='goal'&&<><div className="bg-emerald-700 text-white p-4 flex justify-between items-center"><h2 className="text-base font-black flex items-center gap-2"><Target size={18}/>Objectif</h2><button onClick={()=>setMdl(null)} className="bg-white/10 p-1.5 rounded-full"><X size={16}/></button></div><div className="p-4 space-y-3 overflow-y-auto">
  <div className="grid grid-cols-2 gap-2">{GP.map(p=>{const PI=gi(p.i);return(<button key={p.l} onClick={()=>setGF({...gF,l:p.l,t:gF.t||p.a.toString()})} className={`p-2.5 rounded-xl border-2 text-left ${gF.l===p.l?'border-emerald-500 bg-emerald-50':`${tc.bd}`}`}><PI size={14} className={gF.l===p.l?'text-emerald-500':'text-stone-400'}/><p className="text-[10px] font-bold mt-1">{p.l}</p></button>);})}</div>
  {gF.l==='Objectif libre'&&<input type="text" value={gF.cl} onChange={e=>setGF({...gF,cl:e.target.value})} placeholder="Nom" className={`w-full border rounded-xl p-3 font-bold outline-none ${tc.inp}`}/>}
  <div><label className="text-[8px] font-black uppercase text-stone-400">Cible CHF</label><input type="number" value={gF.t} onChange={e=>setGF({...gF,t:e.target.value})} className={`w-full border rounded-xl p-3 text-lg font-black outline-none mt-1 ${tc.inp}`}/></div>
  <div><label className="text-[8px] font-black uppercase text-stone-400">Déjà épargné</label><input type="number" value={gF.s||''} onChange={e=>setGF({...gF,s:e.target.value})} className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${tc.inp}`}/></div>
  <div><label className="text-[8px] font-black uppercase text-stone-400">Épargne/mois (vide = auto)</label><input type="number" value={gF.m} onChange={e=>setGF({...gF,m:e.target.value})} placeholder={fin.mC.toFixed(0)} className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${tc.inp}`}/></div>
  <button onClick={saveG} disabled={!gF.l||!gF.t} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl disabled:opacity-40">Enregistrer</button>
</div></>}

{/* LESSON */}
{mdl==='lesson'&&aL&&<><div className={`p-4 flex justify-between items-center border-b ${tc.bd}`}><h2 className="text-sm font-black pr-4">{aL.title}</h2><button onClick={()=>setMdl(null)} className={`p-1.5 rounded-full shrink-0 ${tc.sf}`}><X size={16}/></button></div>
<div className="p-4 space-y-4 overflow-y-auto flex-1">
  <p className={`text-xs leading-relaxed whitespace-pre-line ${tc.mt}`}>{aL.content}</p>
  {aL.quiz&&<div className={`p-3 rounded-xl border-2 ${qS?(qA===aL.quiz.c?'border-emerald-500 bg-emerald-50':'border-rose-500 bg-rose-50'):`border-dashed ${tc.bd}`}`}>
    <p className="font-black text-xs mb-2 flex items-center gap-2"><HelpCircle size={14} className="text-amber-500"/>Quiz</p>
    <p className={`text-xs font-medium mb-2 ${tc.tx}`}>{aL.quiz.q}</p>
    {aL.quiz.o.map((o,oi)=><button key={oi} disabled={qS} onClick={()=>{setQA(oi);setQS(true);if(oi===aL.quiz.c)setXp(x=>x+10);}} className={`w-full p-2.5 rounded-lg text-left text-xs mb-1.5 border ${qS?(oi===aL.quiz.c?'border-emerald-500 bg-emerald-100 font-bold':oi===qA?'border-rose-500 bg-rose-100':`${tc.bd}`):`${tc.bd} ${tc.hv} cursor-pointer`}`}>{o}{qS&&oi===aL.quiz.c&&<Check size={12} className="inline ml-1 text-emerald-500"/>}</button>)}
    {qS&&<p className={`text-[10px] font-bold mt-1 ${qA===aL.quiz.c?'text-emerald-600':'text-rose-600'}`}>{qA===aL.quiz.c?'+10 XP ✓':'Relisez la leçon!'}</p>}
  </div>}
</div>
<div className={`p-3 border-t ${tc.bd}`}><button onClick={doneL} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center gap-2"><Award size={16}/>Terminée (+25 XP)</button></div></>}

{/* UPGRADE */}
{mdl==='upgrade'&&<><div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 text-center"><Crown size={28} className="mx-auto mb-1"/><h2 className="text-lg font-black">FatiaBill Premium</h2><p className="text-sm opacity-90">{mode==='pro'?'19.-':'9.-'} CHF/mois</p></div>
<div className="p-4 space-y-3 overflow-y-auto">
  {['Académie complète (16+ leçons quiz)','Coach IA illimité','Objectifs illimités','Projections investissement',mode==='pro'?'Scanner documents':'Export PDF',mode==='pro'?'Dossier fiscal':'Alertes intelligentes'].map((f,i)=><div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50"><CheckCircle2 size={16} className="text-amber-500 shrink-0"/><span className="text-xs font-medium">{f}</span></div>)}
  <div className={`p-3 rounded-xl ${tc.sf} text-center`}><p className="text-[10px] font-bold text-stone-500">Économie estimée</p><p className="font-black text-xl text-emerald-600">&gt; 2'100 CHF/an</p><p className="text-[9px] text-stone-500">en optimisation fiscale (3A)</p></div>
  <button onClick={()=>{handleUpgrade();setMdl(null);}} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl text-base">Activer Premium</button>
  <button onClick={()=>setMdl(null)} className={`w-full py-2 text-sm font-bold ${tc.mt}`}>Continuer gratuit</button>
</div></>}

</div></div>}
</div>);
}
