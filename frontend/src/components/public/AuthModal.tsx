import React, { useState, useEffect, useRef } from 'react';
import { UserRole, User } from '../../types';
import { api } from '../../services/api';
import {
  X,
  Lock,
  Mail,
  UserCheck,
  Store,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  Zap,
  Phone,
  User as UserIcon,
  AlertTriangle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess?: (user: User) => void;
  onAuthSuccess?: (user: User) => void;
}

const ROLE_DETAILS = {
  investor: {
    roleLabel: 'Accredited Investor',
    perks: [
      'Access 0–100 DSS Feasibility Scoring',
      'Compare up to 4 Franchises Side-by-Side',
      'Reserve Exclusive Territory Zones',
    ],
  },
  franchiser: {
    roleLabel: 'Franchise Brand Owner',
    perks: [
      'Publish & Manage Franchise Outlets',
      'Review Vetted Investor Net-Worth',
      'Issue Cryptographic Digital Contracts',
    ],
  },
  admin: {
    roleLabel: 'Platform Administrator',
    perks: [
      'Approve & Audit Franchiser Listings',
      'Monitor Platform Subscription Revenue',
      'Manage User Roles & Security Logs',
    ],
  },
};

const EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com',
  'icloud.com', 'rediffmail.com', 'protonmail.com',
  'company.org', 'business.com',
];

// Auto-capitalize each word in a name string
function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// Check password strength
function getPasswordStrength(pwd: string): { label: string; color: string; width: string } {
  if (pwd.length === 0) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', width: '25%' };
  if (score === 2) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
  if (score === 3) return { label: 'Good', color: 'bg-sky-500', width: '75%' };
  return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  initialRole = 'investor',
  onClose,
  onSuccess,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(
    initialMode || 'login'
  );
  const [role, setRole] = useState<UserRole>(
    initialRole || 'investor'
  );

  // Name fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Phone — 10 digits only, +91 fixed prefix
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Email with autocomplete
  const [emailLocal, setEmailLocal] = useState(''); // part before @
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [showDomainList, setShowDomainList] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const emailRef = useRef<HTMLDivElement>(null);

  // Password + confirm
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatchPopup, setPasswordMismatchPopup] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [investmentBudget, setInvestmentBudget] = useState('2500000');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickFillNotice, setQuickFillNotice] = useState<string | null>(null);

  // Close domain dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emailRef.current && !emailRef.current.contains(e.target as Node)) {
        setShowDomainList(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const targetMode = initialMode || 'login';
      const targetRole = targetMode === 'register' && initialRole === 'admin' 
        ? 'investor' 
        : (initialRole || 'investor');
      setMode(targetMode);
      setRole(targetRole);
      setError(null);
      setQuickFillNotice(null);
      setPasswordMismatchPopup(false);
      setFirstName(''); setLastName('');
      setPhone(''); setPhoneError(null);
      setEmailLocal(''); setEmailDomain('gmail.com');
      setPassword(''); setConfirmPassword('');
      setLoginEmail('');
      setLoginPassword('');
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const fullEmail = emailLocal ? `${emailLocal}@${emailDomain}` : '';
  const fullName = `${firstName} ${lastName}`.trim();
  const strength = getPasswordStrength(password);

  const filteredDomains = EMAIL_DOMAINS.filter((d) =>
    d.toLowerCase().includes(domainSearch.toLowerCase())
  );

  const handlePhoneChange = (val: string) => {
    // Only allow digits, max 10
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError(null);
    }
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError(null);
  };

  const handleCompleteAuth = (user: User) => {
    if (onSuccess) onSuccess(user);
    if (onAuthSuccess) onAuthSuccess(user);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'login') {
      if (!loginEmail.trim()) {
        setError('Please enter your email address.');
        return;
      }
      if (!emailRegex.test(loginEmail.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!loginPassword) {
        setError('Please enter your password.');
        return;
      }
    }

    if (mode === 'register') {
      // Validate name
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter both your first name and last name.');
        return;
      }
      // Validate email
      if (!emailLocal.trim()) {
        setError('Please enter your email username.');
        return;
      }
      if (!emailRegex.test(fullEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      // Franchiser company name
      if (role === 'franchiser' && !companyName.trim()) {
        setError('Please enter your brand or company name.');
        return;
      }
      // Validate phone
      if (phone.length > 0 && phone.length !== 10) {
        setPhoneError('Phone number must be exactly 10 digits');
        return;
      }
      // Password length
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      // Validate passwords match
      if (password !== confirmPassword) {
        setPasswordMismatchPopup(true);
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login({ email: loginEmail, password: loginPassword, role });
        handleCompleteAuth(res.user);
      } else {
        const res = await api.register({
          email: fullEmail,
          password,
          role,
          name: fullName || 'New User',
          phone: phone ? `+91${phone}` : '',
          companyName: role === 'franchiser' ? companyName : undefined,
          minBudget: Number(investmentBudget),
          maxBudget: Number(investmentBudget) * 2,
        });
        handleCompleteAuth(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const activeRoleInfo = ROLE_DETAILS[role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200/90 overflow-hidden relative flex flex-col md:flex-row max-h-[96vh] my-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-30 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200 transition shadow-2xs"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN */}
        <div className="md:w-5/12 bg-gradient-to-b from-sky-50/70 via-slate-50 to-white text-slate-900 p-4 sm:p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 relative overflow-y-auto shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-sky-700 flex items-center justify-center text-white font-black shadow-xs">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="font-black text-slate-900 text-xs tracking-tight block">FranchiseDSS</span>
                <span className="text-[7.5px] font-extrabold tracking-widest text-sky-700 block uppercase">Decision Support System</span>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
              {mode === 'login' ? 'Access Decision Portal' : 'Create Verified Account'}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
              Real-time financial feasibility ratings, verified disclosures, and territory management.
            </p>

            <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {activeRoleInfo.roleLabel}
                </span>
                <span className="text-[8.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase">{role}</span>
              </div>
              <ul className="space-y-1 pt-0.5">
                {activeRoleInfo.perks.map((perk, i) => (
                  <li key={i} className="text-[10.5px] text-slate-600 font-medium flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:w-7/12 p-4 sm:p-5 flex flex-col bg-white overflow-y-auto">

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-2.5 border border-slate-200/80 pr-7 md:pr-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); if (role === 'admin') setRole('investor'); setError(null); }}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Get Started
            </button>
          </div>

          {/* Role Selector */}
          <div className="mb-2.5">
            <label className="block text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              {mode === 'register' ? 'Select Account Type' : 'Select Account Role'}
            </label>
            <div className={`grid ${mode === 'register' ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5`}>
              {['investor', 'franchiser', ...(mode === 'login' ? ['admin'] : [])].map((r) => {
                const Icon = r === 'investor' ? UserCheck : r === 'franchiser' ? Store : ShieldCheck;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r as UserRole)}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      role === r
                        ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${role === r ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="text-[10.5px] capitalize">{r}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notices */}
          {quickFillNotice && (
            <div className="mb-2 p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10.5px] font-medium flex items-center gap-1.5 animate-fade-in">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{quickFillNotice}
            </div>
          )}
          {error && (
            <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />{error}
            </div>
          )}

          {/* PASSWORD MISMATCH POPUP */}
          {passwordMismatchPopup && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 max-w-sm w-full mx-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Passwords Don't Match!</h3>
                <p className="text-xs text-slate-500">
                  The password and confirmation password you entered are different. Please re-enter your password carefully.
                </p>
                <button
                  onClick={() => { setPasswordMismatchPopup(false); setConfirmPassword(''); }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Re-enter Password
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 flex-1">

            {mode === 'register' ? (
              <>
                {/* ── FULL LEGAL NAME ── */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(capitalizeWords(e.target.value))}
                        placeholder="e.g. Rahul"
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-medium bg-slate-50/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(capitalizeWords(e.target.value))}
                        placeholder="e.g. Mehta"
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-medium bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* ── PHONE (India +91, 10 digits) ── */}
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-stretch gap-0 border border-slate-200 rounded-lg overflow-hidden focus-within:border-sky-500 bg-slate-50/50">
                    {/* Fixed India code */}
                    <div className="flex items-center gap-1.5 px-2.5 bg-slate-100 border-r border-slate-200 shrink-0">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span className="text-xs font-bold text-slate-700">+91</span>
                    </div>
                    <div className="relative flex-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs font-medium focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex items-center px-2 shrink-0">
                      <span className={`text-[10px] font-extrabold ${phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {phone.length}/10
                      </span>
                    </div>
                  </div>
                  {phoneError && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{phoneError}
                    </p>
                  )}
                </div>

                {/* ── EMAIL WITH DOMAIN AUTOCOMPLETE ── */}
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div ref={emailRef} className="flex items-stretch border border-slate-200 rounded-lg overflow-visible focus-within:border-sky-500 bg-slate-50/50 relative">
                    <div className="relative flex-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        required
                        value={emailLocal}
                        onChange={(e) => setEmailLocal(e.target.value.replace(/\s/g, '').toLowerCase())}
                        placeholder="yourname"
                        className="w-full pl-8 pr-1 py-1.5 text-xs font-medium focus:outline-none bg-transparent"
                      />
                    </div>
                    <span className="flex items-center text-slate-400 text-xs font-bold px-1 select-none">@</span>
                    <button
                      type="button"
                      onClick={() => { setShowDomainList(!showDomainList); setDomainSearch(''); }}
                      className="flex items-center gap-1 pr-2.5 text-xs font-bold text-sky-700 hover:text-sky-900 focus:outline-none"
                    >
                      {emailDomain}
                      <span className="text-slate-300 ml-0.5">▾</span>
                    </button>

                    {/* Domain Dropdown */}
                    {showDomainList && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <input
                            type="text"
                            value={domainSearch}
                            onChange={(e) => setDomainSearch(e.target.value)}
                            placeholder="Search domain..."
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-sky-500"
                            autoFocus
                          />
                        </div>
                        <ul className="max-h-40 overflow-y-auto">
                          {filteredDomains.map((d) => (
                            <li key={d}>
                              <button
                                type="button"
                                onClick={() => { setEmailDomain(d); setShowDomainList(false); }}
                                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-sky-50 hover:text-sky-700 transition ${emailDomain === d ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'}`}
                              >
                                @{d}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {emailLocal && (
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Full email: <span className="text-sky-700 font-bold">{fullEmail}</span>
                    </p>
                  )}
                </div>

                {/* ── PASSWORD + CONFIRM ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-medium bg-slate-50/50"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {/* Strength Bar */}
                    {password && (
                      <div className="mt-1">
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                        </div>
                        <span className={`text-[9.5px] font-bold mt-0.5 block ${
                          strength.label === 'Weak' ? 'text-rose-600' :
                          strength.label === 'Fair' ? 'text-amber-600' :
                          strength.label === 'Good' ? 'text-sky-600' : 'text-emerald-600'
                        }`}>{strength.label} password</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full pl-8 pr-8 py-1.5 text-xs border rounded-lg focus:outline-none font-medium bg-slate-50/50 ${
                          confirmPassword && confirmPassword !== password
                            ? 'border-rose-400 focus:border-rose-500'
                            : confirmPassword && confirmPassword === password
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : 'border-slate-200 focus:border-sky-500'
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition">
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {/* Inline match indicator */}
                      {confirmPassword && (
                        <div className="absolute right-8 top-2">
                          {confirmPassword === password
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                        </div>
                      )}
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />Passwords do not match
                      </p>
                    )}
                    {confirmPassword && confirmPassword === password && (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />Passwords match
                      </p>
                    )}
                  </div>
                </div>

                {/* Company (franchiser) or Budget (investor) */}
                {role === 'franchiser' && (
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                      Company / Brand Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. BrewCraft Pvt. Ltd."
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-medium bg-slate-50/50"
                      />
                    </div>
                  </div>
                )}

                {role === 'investor' && (
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                      Target Investment Budget <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={investmentBudget}
                      onChange={(e) => setInvestmentBudget(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-medium text-slate-700 bg-slate-50/50"
                    >
                      <option value="1500000">Up to ₹15 Lakhs</option>
                      <option value="2500000">₹15 Lakhs – ₹35 Lakhs</option>
                      <option value="5000000">₹35 Lakhs – ₹75 Lakhs</option>
                      <option value="10000000">₹75 Lakhs – ₹1.5 Crores</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              /* LOGIN MODE */
              <>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-medium bg-slate-50/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-medium bg-slate-50/50"
                    />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition">
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                      : 'Create Verified Account'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100 text-[9.5px] text-slate-400 mt-2">
            Protected by SSL Encryption • FranchiseDSS Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};
