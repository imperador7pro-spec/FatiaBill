import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { auth, db } from './supabase.js';
import {
  DEFAULT_EXPENSES_PRIVATE,
  DEFAULT_EXPENSES_PRO,
  GOAL_PRESETS,
} from './data.js';
import {
  effectivePlan, trialDaysLeft, hasTrialExpired,
  newTrialDates, getLimit, isPremiumLike, currentPeriod,
} from './plan.js';
import { getTheme } from './theme.js';
import { computeFinance, computeGoalProjection } from './finance.js';
import { AuthLoadingScreen, AuthScreen } from './auth.jsx';
import { Landing } from './landing.jsx';
import { CookieBanner } from './cookieBanner.jsx';
import { TopNav, TabBar } from './nav.jsx';
import {
  ModalShell, SalaryModal, TransactionModal, GoalModal, LessonModal, UpgradeModal,
} from './modals.jsx';

// Lazy-loaded chunks — pulled in on first navigation/use
const named = (mod, name) => ({ default: mod[name] });
const OnboardingWizard = lazy(() => import('./onboarding.jsx').then((m) => named(m, 'OnboardingWizard')));
const PrivateDashboard = lazy(() => import('./views/PrivateDashboard.jsx').then((m) => named(m, 'PrivateDashboard')));
const Savings = lazy(() => import('./views/Savings.jsx').then((m) => named(m, 'Savings')));
const Academy = lazy(() => import('./views/Academy.jsx').then((m) => named(m, 'Academy')));
const AICoach = lazy(() => import('./views/AICoach.jsx').then((m) => named(m, 'AICoach')));
const ProDashboard = lazy(() => import('./views/ProDashboard.jsx').then((m) => named(m, 'ProDashboard')));
const Transactions = lazy(() => import('./views/Transactions.jsx').then((m) => named(m, 'Transactions')));
const Scanner = lazy(() => import('./views/Scanner.jsx').then((m) => named(m, 'Scanner')));
const Invoices = lazy(() => import('./views/Invoices.jsx').then((m) => named(m, 'Invoices')));
const TaxSimulator = lazy(() => import('./views/TaxSimulator.jsx').then((m) => named(m, 'TaxSimulator')));
const SalaryBreakdown = lazy(() => import('./views/SalaryBreakdown.jsx').then((m) => named(m, 'SalaryBreakdown')));
const TaxReport = lazy(() => import('./views/TaxReport.jsx').then((m) => named(m, 'TaxReport')));
const GuidePro = lazy(() => import('./views/GuidePro.jsx').then((m) => named(m, 'GuidePro')));
const Setup = lazy(() => import('./views/Setup.jsx').then((m) => named(m, 'Setup')));
const Poursuites = lazy(() => import('./views/Poursuites.jsx').then((m) => named(m, 'Poursuites')));
const Legal = lazy(() => import('./views/Legal.jsx').then((m) => named(m, 'Legal')));

function ViewLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function expensesEqual(a, b) {
  return a.id === b.id
    && a.label === b.label
    && a.amount === b.amount
    && a.category === b.category
    && a.icon === b.icon;
}

function syncExpensesDelta(current, snapshot, userId, mode) {
  if (!snapshot) return; // first load — nothing to sync
  const oldMap = new Map(snapshot.map((e) => [e.id, e]));
  const newMap = new Map(current.map((e) => [e.id, e]));
  for (const [id] of oldMap) {
    if (!newMap.has(id)) db.deleteExpense(id);
  }
  for (const e of current) {
    const old = oldMap.get(e.id);
    if (!old || !expensesEqual(old, e)) db.upsertExpense(e, userId, mode);
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [mode, setMode] = useState(null);
  const [plan, setPlan] = useState('free');
  const [darkMode, setDarkMode] = useState(false);
  const [salary, setSalary] = useState(0);
  const [salarySource, setSalarySource] = useState('Salaire Principal');
  const [profile, setProfile] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const [expensesPrivate, setExpensesPrivate] = useState(DEFAULT_EXPENSES_PRIVATE);
  const [expensesPro, setExpensesPro] = useState(DEFAULT_EXPENSES_PRO);
  const [checkedIds, setCheckedIds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txFilter, setTxFilter] = useState('ALL');
  const [goals, setGoals] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const [completedLessons, setCompletedLessons] = useState([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [view, setView] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [editingGoalIdx, setEditingGoalIdx] = useState(null);
  const [goalInitial, setGoalInitial] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [authView, setAuthView] = useState(null); // null = landing, 'login' or 'signup' = AuthScreen
  const [legalPage, setLegalPage] = useState(null); // null | 'cgu' | 'privacy' | 'mentions'
  const expensesPrivSnapshot = useRef(null);
  const expensesProSnapshot = useRef(null);

  const effPlan = effectivePlan(profile);
  const isPremium = isPremiumLike(effPlan);
  const trialLeft = trialDaysLeft(profile);
  const trialExpired = hasTrialExpired(profile);
  const expenses = mode === 'private' ? expensesPrivate : expensesPro;
  const setExpenses = mode === 'private' ? setExpensesPrivate : setExpensesPro;
  const theme = getTheme(darkMode, mode);

  const loadAllUserData = useCallback(async (u) => {
    if (!u) return;
    const p = await db.getProfile(u.id);
    if (p) {
      setProfile(p);
      setPlan(p.plan || 'free');
      setMode(p.mode || null);
      setSalary(p.salary || 0);
      setSalarySource(p.salary_source || 'Salaire Principal');
      setDarkMode(p.dark_mode || false);
      setOnboardingDone(!!p.onboarding_completed);
    }
    const [prog, expPriv, expPro, txs, gls, docs] = await Promise.all([
      db.getProgress(u.id),
      db.getExpenses(u.id, 'private'),
      db.getExpenses(u.id, 'pro'),
      db.getTransactions(u.id),
      db.getGoals(u.id),
      db.getDocuments(u.id),
    ]);
    if (prog) {
      setCompletedLessons(prog.completed_lessons || []);
      setXp(prog.xp || 0);
      setStreak(prog.streak || 0);
    }
    const seedPriv = expPriv.length > 0
      ? expPriv
      : DEFAULT_EXPENSES_PRIVATE.map((e) => ({ ...e, id: db.newId() }));
    const seedPro = expPro.length > 0
      ? expPro
      : DEFAULT_EXPENSES_PRO.map((e) => ({ ...e, id: db.newId() }));
    setExpensesPrivate(seedPriv);
    setExpensesPro(seedPro);
    expensesPrivSnapshot.current = seedPriv;
    expensesProSnapshot.current = seedPro;
    if (expPriv.length === 0) seedPriv.forEach((e) => db.upsertExpense(e, u.id, 'private'));
    if (expPro.length === 0) seedPro.forEach((e) => db.upsertExpense(e, u.id, 'pro'));
    setTransactions(txs);
    setGoals(gls);
    setDocuments(docs);
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const u = await auth.getUser();
      if (u) {
        setUser(u);
        await loadAllUserData(u);
      }
      setAuthLoading(false);
    };
    checkUser();

    const { data: listener } = auth.onAuthChange((ev) => {
      if (ev === 'SIGNED_OUT') {
        setUser(null);
        setMode(null);
        setPlan('free');
        setProfile(null);
        setOnboardingDone(false);
        setDataLoaded(false);
        setTransactions([]);
        setGoals([]);
        setDocuments([]);
        setExpensesPrivate(DEFAULT_EXPENSES_PRIVATE);
        setExpensesPro(DEFAULT_EXPENSES_PRO);
        expensesPrivSnapshot.current = null;
        expensesProSnapshot.current = null;
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setTimeout(async () => {
        const u = await auth.getUser();
        if (u) {
          const p = await db.getProfile(u.id);
          if (p) setPlan(p.plan || 'premium');
        }
      }, 2000);
      window.history.replaceState({}, '', '/');
    }

    return () => { listener?.subscription?.unsubscribe(); };
  }, []);

  const finance = useMemo(
    () => computeFinance({ mode, salary, expenses, transactions }),
    [mode, salary, expenses, transactions],
  );

  // Debounced persistence for expenses (label/amount edits trigger many setState calls).
  useEffect(() => {
    if (!user || !dataLoaded) return;
    const t = setTimeout(() => {
      syncExpensesDelta(expensesPrivate, expensesPrivSnapshot.current, user.id, 'private');
      expensesPrivSnapshot.current = expensesPrivate;
    }, 600);
    return () => clearTimeout(t);
  }, [expensesPrivate, user, dataLoaded]);

  useEffect(() => {
    if (!user || !dataLoaded) return;
    const t = setTimeout(() => {
      syncExpensesDelta(expensesPro, expensesProSnapshot.current, user.id, 'pro');
      expensesProSnapshot.current = expensesPro;
    }, 600);
    return () => clearTimeout(t);
  }, [expensesPro, user, dataLoaded]);

  const goalProjection = useCallback(
    (g) => computeGoalProjection(g, finance.monthlyCapacity),
    [finance.monthlyCapacity],
  );

  const handleSignUp = async (email, password) => {
    const { data, error } = await auth.signUp(email, password);
    if (!error && data?.user) {
      setUser(data.user);
      await loadAllUserData(data.user);
    }
    return { error };
  };

  const handleSignIn = async (email, password) => {
    const { data, error } = await auth.signIn(email, password);
    if (!error && data?.user) {
      setUser(data.user);
      await loadAllUserData(data.user);
    }
    return { error };
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setUser(null);
    setMode(null);
    setPlan('free');
    setProfile(null);
    setOnboardingDone(false);
  };

  const handleOnboardingComplete = async (payload) => {
    if (!user) return;
    const wasAlreadyPremium = profile?.plan === 'premium';
    const trialDates = (!wasAlreadyPremium && !profile?.trial_started_at)
      ? newTrialDates()
      : {};
    const fullPayload = {
      ...payload,
      ...(wasAlreadyPremium ? {} : (profile?.trial_started_at ? {} : { plan: 'trial', ...trialDates })),
    };
    await db.updateProfile(user.id, fullPayload);
    setProfile((prev) => ({ ...(prev || {}), ...fullPayload }));
    setMode(payload.mode);
    if (!wasAlreadyPremium && !profile?.trial_started_at) setPlan('trial');
    setOnboardingDone(true);
    setView(payload.mode === 'pro' ? 'pro_dashboard' : 'dashboard');
    if (payload.mode === 'private') setTimeout(() => setModal('sal'), 400);
  };

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, mode }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else alert(error || 'Erreur de paiement');
    } catch {
      alert('Erreur de connexion au service de paiement');
    }
  };

  const sendAi = async () => {
    if (!aiInput.trim()) return;
    const period = currentPeriod();
    const usedThisPeriod = profile?.ai_messages_period === period
      ? (profile?.ai_messages_used ?? 0)
      : 0;
    const aiLimit = getLimit(effPlan, 'ai');
    if (usedThisPeriod >= aiLimit) {
      setModal('upgrade');
      return;
    }
    const userText = aiInput.trim();
    setAiMessages((prev) => [...prev, { r: 'u', t: userText }]);
    setAiInput('');
    setAiLoading(true);
    const totalExpenses = expenses.reduce((a, e) => a + (e.amount || 0), 0);
    const age = profile?.birth_year ? new Date().getFullYear() - profile.birth_year : null;
    const ctxObj = {
      mode,
      canton: profile?.canton || null,
      city: profile?.city || null,
      age,
      civil_status: profile?.civil_status || null,
      num_children: profile?.num_children ?? 0,
      nationality_status: profile?.nationality_status || null,
    };
    if (mode === 'private') {
      Object.assign(ctxObj, {
        employment_status: profile?.employment_status || null,
        salary_monthly: salary || null,
        fixed_expenses_monthly: totalExpenses || null,
        monthly_capacity: finance.monthlyCapacity ?? null,
        has_3a: profile?.has_3a ?? null,
        has_lpp: profile?.has_lpp ?? null,
        lamal_franchise: profile?.lamal_franchise ?? null,
      });
    } else {
      Object.assign(ctxObj, {
        business_form: profile?.business_form || null,
        business_sector: profile?.business_sector || null,
        company_name: profile?.company_name || null,
        tva_registered: profile?.tva_registered ?? null,
        tva_method: profile?.tva_method || null,
        revenue_paid: finance.paidRevenue ?? null,
        revenue_pending: finance.pendingRevenue ?? null,
        fixed_expenses: finance.fixedExpenses ?? null,
        paid_suppliers: finance.paidSuppliers ?? null,
      });
    }
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, context: ctxObj, mode }),
      });
      const d = await r.json();
      setAiMessages((prev) => [...prev, { r: 'a', t: d.response || 'Erreur.' }]);
      const nextUsed = usedThisPeriod + 1;
      setProfile((prev) => prev && ({ ...prev, ai_messages_used: nextUsed, ai_messages_period: period }));
      if (user) {
        db.updateProfile(user.id, { ai_messages_used: nextUsed, ai_messages_period: period });
      }
    } catch {
      setAiMessages((prev) => [...prev, { r: 'a', t: 'Erreur de connexion.' }]);
    }
    setAiLoading(false);
  };

  const saveSalary = ({ amount, source }) => {
    setSalary(amount);
    setSalarySource(source);
    setModal(null);
    if (user) db.updateProfile(user.id, { salary: amount, salary_source: source });
  };

  const saveProfileFields = async (fields) => {
    if (!user) return;
    setProfile((prev) => ({ ...(prev || {}), ...fields }));
    if (fields.mode && fields.mode !== mode) setMode(fields.mode);
    await db.updateProfile(user.id, fields);
  };

  const saveTransaction = (form) => {
    const tx = {
      id: db.newId(),
      ...form,
      amount: Number(form.amount) || 0,
      date: form.date || new Date().toISOString().split('T')[0],
    };
    setTransactions([tx, ...transactions]);
    setModal(null);
    if (user) db.upsertTransaction(tx, user.id);
  };

  const toggleTransactionStatus = (id) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, status: t.status === 'PAID' ? 'PENDING' : 'PAID' } : t,
    );
    setTransactions(updated);
    const changed = updated.find((t) => t.id === id);
    if (user && changed) db.upsertTransaction(changed, user.id);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    if (user) db.deleteTransaction(id);
  };

  const openAddGoal = () => {
    if (goals.length >= getLimit(effPlan, 'goals')) {
      setModal('upgrade');
      return;
    }
    setEditingGoalIdx(null);
    setGoalInitial({ l: '', t: '', s: 0, m: '', cl: '' });
    setModal('goal');
  };

  const openEditGoal = (idx) => {
    const g = goals[idx];
    setEditingGoalIdx(idx);
    setGoalInitial({ l: g.l, t: g.t.toString(), s: g.s, m: g.m?.toString() || '', cl: '' });
    setModal('goal');
  };

  const saveGoal = (form) => {
    const preset = GOAL_PRESETS.find((p) => p.l === form.l);
    const baseGoal = {
      l: form.cl || form.l,
      i: preset?.i || 'Target',
      t: parseFloat(form.t) || 10000,
      s: parseFloat(form.s) || 0,
      m: form.m ? parseFloat(form.m) : '',
    };
    let saved;
    if (editingGoalIdx !== null) {
      const existing = goals[editingGoalIdx];
      saved = { ...existing, ...baseGoal };
      setGoals(goals.map((x, i) => (i === editingGoalIdx ? saved : x)));
      setEditingGoalIdx(null);
    } else {
      saved = { id: db.newId(), ...baseGoal };
      setGoals([...goals, saved]);
    }
    setModal(null);
    if (user && saved) db.upsertGoal(saved, user.id);
  };

  const deleteGoal = (idx) => {
    const removed = goals[idx];
    setGoals(goals.filter((_, i) => i !== idx));
    if (user && removed) db.deleteGoal(removed.id);
  };

  const runScan = async (imageDataUrl, mimeType, clientError) => {
    if (clientError) {
      setScanError(clientError);
      return;
    }
    if (!imageDataUrl) return;
    const period = currentPeriod();
    const usedThisPeriod = profile?.ai_messages_period === period
      ? (profile?.ai_messages_used ?? 0)
      : 0;
    const aiLimit = getLimit(effPlan, 'ai');
    if (usedThisPeriod >= aiLimit) {
      setModal('upgrade');
      return;
    }
    setScanError(null);
    setScanResult(null);
    setScanning(true);
    try {
      const r = await fetch('/api/ai/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageDataUrl, mime_type: mimeType || 'image/jpeg' }),
      });
      const d = await r.json();
      if (!r.ok || d.error) {
        setScanError(d.error || 'Échec de l\'analyse');
      } else {
        setScanResult(d.extracted);
        const nextUsed = usedThisPeriod + 1;
        setProfile((prev) => prev && ({ ...prev, ai_messages_used: nextUsed, ai_messages_period: period }));
        if (user) db.updateProfile(user.id, { ai_messages_used: nextUsed, ai_messages_period: period });
      }
    } catch (e) {
      setScanError('Erreur de connexion au scanner');
    }
    setScanning(false);
  };

  const editScanResult = (next) => setScanResult(next);
  const clearScanError = () => { setScanError(null); setScanResult(null); };

  const classifyScan = (type) => {
    if (!scanResult) return;
    const today = new Date().toISOString().split('T')[0];
    const doc = {
      id: db.newId(),
      label: scanResult.label || scanResult.vendor || 'Document scanné',
      amount: scanResult.amount || 0,
      date: scanResult.date || today,
      vendor: scanResult.vendor || null,
      tva_amount: scanResult.tva_amount ?? null,
      category: scanResult.category || null,
      type,
    };
    setDocuments([doc, ...documents]);
    if (user) db.insertDocument(doc, user.id);
    if (type !== 'JUSTIFICATIF') {
      const tx = {
        id: db.newId(),
        type: type === 'CLIENT' ? 'IN' : 'OUT',
        amount: doc.amount,
        label: doc.label,
        date: doc.date,
        status: 'PAID',
        cat: type === 'FOURNISSEUR' ? doc.category : null,
      };
      setTransactions([tx, ...transactions]);
      if (user) db.upsertTransaction(tx, user.id);
    }
    setScanResult(null);
    setScanError(null);
  };

  const openLesson = (lesson) => {
    if (!lesson.free && !isPremium) {
      setModal('upgrade');
      return;
    }
    setActiveLesson(lesson);
    setModal('lesson');
  };

  const completeLesson = () => {
    if (!activeLesson) return;
    const alreadyDone = completedLessons.includes(activeLesson.id);
    const newDone = alreadyDone ? completedLessons : [...completedLessons, activeLesson.id];
    const newXp = alreadyDone ? xp : xp + 25;
    const newStreak = alreadyDone ? streak : streak + 1;
    setCompletedLessons(newDone);
    setXp(newXp);
    setStreak(newStreak);
    setModal(null);
    if (user) {
      db.upsertProgress({
        user_id: user.id,
        completed_lessons: newDone,
        xp: newXp,
        streak: newStreak,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  if (authLoading) return <AuthLoadingScreen />;

  if (legalPage) {
    return (
      <Suspense fallback={<AuthLoadingScreen />}>
        <Legal
          page={legalPage}
          onClose={() => setLegalPage(null)}
          onNavigate={(p) => setLegalPage(p)}
        />
      </Suspense>
    );
  }

  if (!user) {
    if (authView) {
      return (
        <AuthScreen
          theme={theme}
          initialView={authView}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onBack={() => setAuthView(null)}
        />
      );
    }
    return (
      <>
        <Landing
          theme={theme}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          onSignIn={() => setAuthView('login')}
          onSignUp={() => setAuthView('signup')}
          onOpenLegal={setLegalPage}
        />
        <CookieBanner onOpenPrivacy={() => setLegalPage('privacy')} />
      </>
    );
  }
  if (!onboardingDone) {
    return (
      <Suspense fallback={<AuthLoadingScreen />}>
        <OnboardingWizard
          theme={theme}
          user={user}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          existingProfile={profile}
          onComplete={handleOnboardingComplete}
          onSignOut={handleSignOut}
        />
      </Suspense>
    );
  }

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors ${theme.bg} ${theme.tx}`}>
      <TopNav
        theme={theme}
        mode={mode}
        xp={xp}
        streak={streak}
        effPlan={effPlan}
        trialLeft={trialLeft}
        trialExpired={trialExpired}
        onUpgrade={() => setModal('upgrade')}
        onToggleDark={() => setDarkMode(!darkMode)}
        onSignOut={handleSignOut}
      />
      <main className="max-w-4xl mx-auto p-4 space-y-5">
        <TabBar theme={theme} mode={mode} view={view} onChangeView={setView} />

        <Suspense fallback={<ViewLoading />}>
        {mode === 'private' && view === 'dashboard' && (
          <PrivateDashboard
            theme={theme}
            salary={salary}
            salarySource={salarySource}
            freeMoney={finance.freeMoney}
            expenses={expenses}
            checkedIds={checkedIds}
            onOpenSalary={() => setModal('sal')}
            onToggleCheck={toggleCheck}
          />
        )}

        {mode === 'private' && view === 'savings' && (
          <Savings
            theme={theme}
            goals={goals}
            monthlyCapacity={finance.monthlyCapacity}
            salary={salary}
            computeProjection={goalProjection}
            onOpenSalary={() => setModal('sal')}
            onAddGoal={openAddGoal}
            onEditGoal={openEditGoal}
            onDeleteGoal={deleteGoal}
          />
        )}

        {mode === 'private' && view === 'academy' && (
          <Academy
            theme={theme}
            completedLessons={completedLessons}
            xp={xp}
            isPremium={isPremium}
            onOpenLesson={openLesson}
          />
        )}

        {((mode === 'private' && view === 'ai') || (mode === 'pro' && view === 'ai_pro')) && (
          <AICoach
            theme={theme}
            mode={mode}
            effPlan={effPlan}
            aiUsed={profile?.ai_messages_period === currentPeriod() ? (profile?.ai_messages_used ?? 0) : 0}
            aiLimit={getLimit(effPlan, 'ai')}
            messages={aiMessages}
            input={aiInput}
            loading={aiLoading}
            onInput={setAiInput}
            onSend={sendAi}
            onUpgrade={() => setModal('upgrade')}
          />
        )}

        {mode === 'pro' && view === 'pro_dashboard' && <ProDashboard theme={theme} finance={finance} />}

        {mode === 'pro' && view === 'transactions' && (
          <Transactions
            theme={theme}
            transactions={transactions}
            filter={txFilter}
            onChangeFilter={setTxFilter}
            onAddTx={() => setModal('tx')}
            onToggleStatus={toggleTransactionStatus}
            onDeleteTx={deleteTransaction}
          />
        )}

        {mode === 'pro' && view === 'invoices' && (
          <Invoices
            theme={theme}
            profile={profile}
            effPlan={effPlan}
            isPremium={isPremium}
            onUpgrade={() => setModal('upgrade')}
          />
        )}

        {mode === 'pro' && view === 'scanner' && (
          <Scanner
            theme={theme}
            scanning={scanning}
            scanResult={scanResult}
            scanError={scanError}
            documents={documents}
            onScan={runScan}
            onClassify={classifyScan}
            onEditResult={editScanResult}
            onClearError={clearScanError}
          />
        )}

        {mode === 'pro' && view === 'tax_report' && (
          <TaxReport theme={theme} companyName={profile?.company_name || 'Mon Entreprise'} expenses={expenses} finance={finance} />
        )}

        {mode === 'pro' && view === 'academy_pro' && (
          <GuidePro
            theme={theme}
            completedLessons={completedLessons}
            xp={xp}
            isPremium={isPremium}
            onOpenLesson={openLesson}
          />
        )}

        {view === 'tax_sim' && (
          <TaxSimulator theme={theme} profile={profile} mode={mode} />
        )}

        {view === 'salary_breakdown' && (
          <SalaryBreakdown theme={theme} profile={profile} />
        )}

        {view === 'sos_poursuite' && (
          <Poursuites theme={theme} mode={mode} />
        )}

        {view === 'setup' && (
          <Setup
            theme={theme}
            mode={mode}
            profile={profile}
            expenses={expenses}
            setExpenses={setExpenses}
            onSaveProfile={saveProfileFields}
            onAccountDeleted={async () => {
              await auth.signOut();
              window.location.href = '/';
            }}
          />
        )}
        </Suspense>
      </main>

      <ModalShell theme={theme} modal={modal} onClose={() => setModal(null)}>
        {modal === 'sal' && (
          <SalaryModal
            theme={theme}
            initial={{ amount: salary, source: salarySource }}
            onClose={() => setModal(null)}
            onSave={saveSalary}
          />
        )}
        {modal === 'tx' && (
          <TransactionModal theme={theme} onClose={() => setModal(null)} onSave={saveTransaction} />
        )}
        {modal === 'goal' && (
          <GoalModal
            theme={theme}
            initial={goalInitial}
            defaultMonthly={finance.monthlyCapacity}
            onClose={() => setModal(null)}
            onSave={saveGoal}
          />
        )}
        {modal === 'lesson' && activeLesson && (
          <LessonModal
            theme={theme}
            lesson={activeLesson}
            onClose={() => setModal(null)}
            onComplete={completeLesson}
            onQuizCorrect={() => setXp((x) => x + 10)}
          />
        )}
        {modal === 'upgrade' && (
          <UpgradeModal
            theme={theme}
            mode={mode}
            effPlan={effPlan}
            trialLeft={trialLeft}
            onClose={() => setModal(null)}
            onUpgrade={handleUpgrade}
          />
        )}
      </ModalShell>
    </div>
  );
}
