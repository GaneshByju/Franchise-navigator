import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import {
  UserCheck,
  CheckCircle2,
  DollarSign,
  MapPin,
  TrendingUp,
  Save,
  Building,
  Mail,
  Phone
} from 'lucide-react';

interface InvestorProfileViewProps {
  currentUser: User;
  onRefreshUser: () => void;
}

export const InvestorProfileView: React.FC<InvestorProfileViewProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const profile = (currentUser.profile as any) || {};

  const [minBudget, setMinBudget] = useState(profile.min_budget || 1500000);
  const [maxBudget, setMaxBudget] = useState(profile.max_budget || 5000000);
  const [expectedRoi, setExpectedRoi] = useState(profile.expected_roi || 30);
  const [paybackMonths, setPaybackMonths] = useState(profile.preferred_payback_months || 18);
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || 'Intermediate (1-3 yrs retail/ops)');
  const [investmentType, setInvestmentType] = useState(profile.preferred_investment_type || 'Both FOFO & FOCO');
  const [preferredLocations, setPreferredLocations] = useState(
    typeof profile.preferred_locations === 'string'
      ? profile.preferred_locations
      : 'Bangalore, Hyderabad, Mumbai, Pune'
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await api.updateInvestorProfile({
        userId: currentUser.id,
        min_budget: Number(minBudget),
        max_budget: Number(maxBudget),
        expected_roi: Number(expectedRoi),
        preferred_payback_months: Number(paybackMonths),
        experience_level: experienceLevel,
        preferred_investment_type: investmentType,
        preferred_locations: preferredLocations,
      });

      if (res.success) {
        setSuccessMsg('Investor parameters & investment criteria successfully updated.');
        onRefreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Investor Due Diligence Profile & Allocation Criteria
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure your capital deployment parameters, target yield thresholds, and expansion territory preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Identity Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Accredited Investor Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">KYC Status</label>
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Accredited Investor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Parameters Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            Target Capital Allocation Range (INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Investment (INR)</label>
              <input
                type="number"
                step="100000"
                value={minBudget}
                onChange={(e) => setMinBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-indigo-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">₹{(minBudget / 100000).toFixed(1)} Lakhs</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maximum Investment (INR)</label>
              <input
                type="number"
                step="100000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-indigo-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">₹{(maxBudget / 100000).toFixed(1)} Lakhs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Target ROI (% p.a.)</label>
              <input
                type="number"
                value={expectedRoi}
                onChange={(e) => setExpectedRoi(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Payback (Months)</label>
              <input
                type="number"
                value={paybackMonths}
                onChange={(e) => setPaybackMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational Model Preference</label>
              <select
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-indigo-600"
              >
                <option value="Both FOFO & FOCO">Both FOFO & FOCO</option>
                <option value="FOCO Only (Hands-off Management)">FOCO Only (Hands-off Management)</option>
                <option value="FOFO Only (Active Owner Operator)">FOFO Only (Active Owner Operator)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Territory & Experience Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Territory & Operational Capabilities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Operating Cities</label>
              <input
                type="text"
                value={preferredLocations}
                onChange={(e) => setPreferredLocations(e.target.value)}
                placeholder="e.g. Bangalore, Mumbai, Pune"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-indigo-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Comma-separated expansion locations</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-indigo-600"
              >
                <option value="Beginner (First-time business owner)">Beginner (First-time business owner)</option>
                <option value="Intermediate (1-3 yrs retail/ops)">Intermediate (1-3 yrs retail/ops)</option>
                <option value="Experienced (3-5 yrs multi-unit)">Experienced (3-5 yrs multi-unit)</option>
                <option value="Veteran Investor (5+ yrs commercial enterprise)">Veteran Investor (5+ yrs commercial enterprise)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span>Saving Preferences...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Allocation Criteria</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
