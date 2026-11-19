import React, { useState } from 'react';
import { FranchiseListing, User } from '../../types';
import { api } from '../../services/api';
import {
  X,
  FileCheck,
  Building,
  MapPin,
  DollarSign,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise: FranchiseListing | null;
  currentUser: User | null;
  onSuccess: () => void;
  onOpenAuth: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  franchise,
  currentUser,
  onSuccess,
  onOpenAuth,
}) => {
  const [proposedBudget, setProposedBudget] = useState<number>(franchise?.total_investment_est || 3500000);
  const [targetLocation, setTargetLocation] = useState<string>('Bangalore (Indiranagar / Koramangala)');
  const [message, setMessage] = useState<string>(
    'I have evaluated the feasibility data and have ₹35L liquid capital allocated for this commercial unit. Looking to review the master agreement terms.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !franchise) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!proposedBudget || isNaN(Number(proposedBudget)) || Number(proposedBudget) < 100000) {
      setErrorMsg('Please specify a valid capital commitment (minimum ₹1,00,000).');
      return;
    }
    if (!targetLocation.trim()) {
      setErrorMsg('Please provide a target expansion location.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please provide an investor note or operational background.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.submitApplication({
        investor_id: currentUser.id,
        franchise_id: franchise.id,
        target_location: targetLocation,
        proposed_budget: Number(proposedBudget),
        message,
      });

      if (res.success) {
        alert('Franchise application proposal successfully submitted to the franchiser! You can track approval status in your investor dashboard.');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden relative my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Investment Proposal
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Apply for {franchise.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Franchise Summary Box */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">{franchise.name}</div>
              <div className="text-slate-500 text-[11px]">{franchise.business_type} • {franchise.business_model}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Est Outlay</span>
              <span className="font-bold text-indigo-700">₹{(franchise.total_investment_est / 100000).toFixed(1)}L</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Your Available Capital Commitment (INR) *
            </label>
            <input
              type="number"
              required
              min="500000"
              step="100000"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-indigo-600 text-xs"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              ₹{(proposedBudget / 100000).toFixed(1)} Lakhs allocated capital
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Proposed Target Expansion Territory / City *
            </label>
            <input
              type="text"
              required
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              placeholder="e.g. Bangalore Urban (Indiranagar / Whitefield)"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-indigo-600 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Investor Note / Operational Experience *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Summarize your commercial experience, liquidity readiness, and timeline..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-indigo-600 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Proposal...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
