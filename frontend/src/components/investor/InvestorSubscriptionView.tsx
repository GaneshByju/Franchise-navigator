import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  ArrowRight,
  Star,
  Check
} from 'lucide-react';

interface InvestorSubscriptionViewProps {
  currentUser: User;
  onRefreshUser: (updatedUser?: User) => void;
}

export const InvestorSubscriptionView: React.FC<InvestorSubscriptionViewProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const [activePlan, setActivePlan] = useState<'Standard' | 'Premium'>(
    ((currentUser.profile as any)?.plan_type === 'Premium' ? 'Premium' : 'Standard')
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Synchronize whenever currentUser updates
  React.useEffect(() => {
    const p = (currentUser.profile as any)?.plan_type;
    if (p) {
      setActivePlan(p === 'Premium' ? 'Premium' : 'Standard');
    }
  }, [currentUser]);

  const handleUpgrade = async (plan: 'Standard' | 'Premium') => {
    if (plan === activePlan) return;
    setLoadingPlan(plan);
    setMsg(null);

    try {
      const res = await api.upgradeInvestorPlan(currentUser.id, plan);
      if (res.success) {
        setActivePlan(plan);
        setMsg(`Successfully updated your investor membership to the ${plan} Tier.`);
        if (res.data) {
          onRefreshUser(res.data);
        } else {
          onRefreshUser();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Membership plan update failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Investor Membership Plans &amp; Capabilities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select between our Standard (Free) tier and our Premium institutional investor pass.
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* PRICING CARDS - EXACTLY 2 PLANS: STANDARD & PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        
        {/* 1. STANDARD PLAN */}
        <div className={`p-5 rounded-2xl border bg-white flex flex-col justify-between transition text-xs ${
          activePlan === 'Standard'
            ? 'border-slate-400 ring-2 ring-slate-400/20 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-slate-900 text-base">Standard Plan</span>
              {activePlan === 'Standard' && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                  Active Tier
                </span>
              )}
            </div>

            <div className="text-2xl font-black text-slate-900">
              ₹0 <span className="text-xs text-slate-400 font-normal">/ forever free</span>
            </div>

            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Essential membership for first-time franchise buyers exploring market opportunities.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <span>Access Verified Public Franchise Marketplace</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Up to <strong>5 Active Unit Applications</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Direct E2EE Encrypted Messaging with Franchisers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Standard Location Search &amp; Filtering</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Basic Portfolio Tracking</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleUpgrade('Standard')}
            disabled={activePlan === 'Standard' || loadingPlan !== null}
            className="mt-6 w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
          >
            {loadingPlan === 'Standard' ? (
              <span>Switching to Standard...</span>
            ) : activePlan === 'Standard' ? (
              <span>Current Active Plan</span>
            ) : (
              <span>Switch to Standard Plan</span>
            )}
          </button>
        </div>

        {/* 2. PREMIUM PLAN (RECOMMENDED) */}
        <div className={`p-5 rounded-2xl border bg-gradient-to-b from-sky-50/60 via-white to-white flex flex-col justify-between relative shadow-md text-xs ${
          activePlan === 'Premium'
            ? 'border-sky-600 ring-2 ring-sky-600/30'
            : 'border-sky-300 hover:border-sky-500'
        }`}>
          <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-sky-700 text-white rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-2xs">
            ★ Recommended Upgrade
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sky-950 text-lg flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                Premium Plan
              </span>
              {activePlan === 'Premium' && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  Active Tier
                </span>
              )}
            </div>

            <div className="text-3xl font-black text-slate-900">
              ₹9,999 <span className="text-xs text-slate-400 font-normal">/ annual pass</span>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Full algorithmic decision support engine for active portfolio investors and multi-unit operators.
            </p>

            <ul className="mt-6 space-y-3 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span><strong>Unlimited Franchise Applications &amp; Operating Units (25 Cap)</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Full Algorithmic 0–100 Feasibility Engine Breakdown</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Side-by-Side Brand Matrix Comparison (Up to 4 Brands)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Priority 1-on-1 Scheduled Video Discovery Calls</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Digital E-Signature Contracts &amp; Territory Reservations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Executive Due Diligence Dossier Export</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleUpgrade('Premium')}
            disabled={activePlan === 'Premium' || loadingPlan !== null}
            className="mt-8 w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-sky-700 hover:bg-sky-800 text-white disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loadingPlan === 'Premium' ? (
              <span>Activating Premium...</span>
            ) : activePlan === 'Premium' ? (
              <span>Active Premium Plan</span>
            ) : (
              <>
                <span>Upgrade to Premium (₹9,999/yr)</span>
                <ArrowRight className="w-4 h-4 text-sky-200" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
