import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { OnboardingWizard } from './onboarding.jsx';
import { TopNav, TabBar } from './nav.jsx';
import { PrivateDashboard } from './views/PrivateDashboard.jsx';
import { Savings } from './views/Savings.jsx';
import { Academy } from './views/Academy.jsx';
import { AICoach } from './views/AICoach.jsx';
import { ProDashboard } from './views/ProDashboard.jsx';
import { Transactions } from './views/Transactions.jsx';
import { Scanner } from './views/Scanner.jsx';
import { TaxReport } from './views/TaxReport.jsx';
import { GuidePro } from './views/GuidePro.jsx';
import { Setup } from './views/Setup.jsx';
import {
  ModalShell, SalaryModal, TransactionModal, GoalModal, LessonModal, UpgradeModal,
} from './modals.jsx';

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

  const effPlan = effectivePlan(profile);
  const isPremium = isPremiumLike(effPlan);
  const trialLeft = trialDaysLeft(profile);
  const trialExpired = hasTrialExpired(profile);
  const expenses = mode === 'private' ? expensesPrivate : expensesPro;
  const setExpenses = mode === 'private' ? setExpensesPrivate : setExpensesPro;
  const theme = getTheme(darkMode, mode);

  useEffect(() => {
    const checkUser = async () => {
      const u = await auth.getUser();
      if (u) {
        setUser(u);
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
        const prog = await db.getProgress(u.id);
        if (prog) {
          setCompletedLessons(prog.completed_lessons || []);
          setXp(prog.xp || 0);
          setStreak(prog.streak || 0);
        }
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

  const goalProjection = useCallback(
    (g) => computeGoalProjection(g, finance.monthlyCapacity),
    [finance.monthlyCapacity],
  );

  const handleSignUp = async (email, password) => {
    const { data, error } = await auth.signUp(email, password);
    if (!error && data?.user) setUser(data.user);
    return { error };
  };

  const handleSignIn = async (email, password) => {
    const { data, error } = await auth.signIn(email, password);
    if (!error && data?.user) {
      setUser(data.user);
      const p = await db.getProfile(data.user.id);
      if (p?.mode) {
        setPlan(p.plan || 'free');
        setSalary(p.salary || 0);
      }
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
    const ctx = mode === 'private'
      ? `Salaire:${salary},Charges:${totalExpenses},Épargne:${finance.monthlyCapacity.toFixed(0)}`
      : `CA:${finance.paidRevenue},Charges:${finance.fixedExpenses + finance.paidSuppliers}`;
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, context: ctx, mode }),
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

  const saveTransaction = (form) => {
    const tx = {
      id: Date.now().toString(),
      ...form,
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions([tx, ...transactions]);
    setModal(null);
  };

  const toggleTransactionStatus = (id) => {
    setTransactions(transactions.map((t) =>
      t.id === id ? { ...t, status: t.status === 'PAID' ? 'PENDING' : 'PAID' } : t,
    ));
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
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
    const goal = {
      id: Date.now().toString(),
      l: form.cl || form.l,
      i: preset?.i || 'Target',
      t: parseFloat(form.t) || 10000,
      s: parseFloat(form.s) || 0,
      m: form.m ? parseFloat(form.m) : '',
    };
    if (editingGoalIdx !== null) {
      setGoals(goals.map((x, i) => (i === editingGoalIdx ? { ...x, ...goal, id: x.id } : x)));
      setEditingGoalIdx(null);
    } else {
      setGoals([...goals, goal]);
    }
    setModal(null);
  };

  const deleteGoal = (idx) => setGoals(goals.filter((_, i) => i !== idx));

  const runScan = () => {
    setScanResult(null);
    setScanning(true);
    setTimeout(() => {
      setScanResult({
        a: '127.50',
        l: 'Restaurant Le Comptoir — Client',
        d: new Date().toISOString().split('T')[0],
        cat: 'Repas & Représentation',
      });
      setScanning(false);
    }, 2000);
  };

  const classifyScan = (type) => {
    if (!scanResult) return;
    setDocuments([{ id: Date.now().toString(), ...scanResult, type, date: scanResult.d }, ...documents]);
    if (type !== 'JUSTIFICATIF') {
      setTransactions([
        {
          id: (Date.now() + 1).toString(),
          type: type === 'CLIENT' ? 'IN' : 'OUT',
          amount: parseFloat(scanResult.a),
          label: scanResult.l,
          date: scanResult.d,
          status: 'PAID',
          cat: type === 'FOURNISSEUR' ? scanResult.cat : null,
        },
        ...transactions,
      ]);
    }
    setScanResult(null);
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
  if (!user) return <AuthScreen theme={theme} onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  if (!onboardingDone) {
    return (
      <OnboardingWizard
        theme={theme}
        user={user}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        existingProfile={profile}
        onComplete={handleOnboardingComplete}
        onSignOut={handleSignOut}
      />
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

        {mode === 'pro' && view === 'scanner' && (
          <Scanner
            theme={theme}
            scanning={scanning}
            scanResult={scanResult}
            documents={documents}
            onScan={runScan}
            onClassify={classifyScan}
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

        {view === 'setup' && <Setup theme={theme} expenses={expenses} setExpenses={setExpenses} />}
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
