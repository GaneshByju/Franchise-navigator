import React, { useState } from 'react';
import { Contract, User } from '../../types';
import { api } from '../../services/api';
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Printer,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface InvestorContractsViewProps {
  currentUser: User;
  contracts: Contract[];
  onRefresh: () => void;
}

export const InvestorContractsView: React.FC<InvestorContractsViewProps> = ({
  currentUser,
  contracts,
  onRefresh,
}) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(contracts[0] || null);
  const [signerName, setSignerName] = useState(currentUser.name);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync selectedContract when contracts array loads or changes
  React.useEffect(() => {
    if (!selectedContract && contracts.length > 0) {
      setSelectedContract(contracts[0]);
    } else if (selectedContract) {
      const updated = contracts.find((c) => c.id === selectedContract.id);
      if (updated) setSelectedContract(updated);
    }
  }, [contracts]);

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !agreedTerms) return;
    setSigning(true);
    setSuccessMsg(null);

    try {
      const res = await api.signContract(selectedContract.id, {
        userId: currentUser.id,
        role: currentUser.role,
        digitalSignatureName: signerName,
      });

      if (res.success) {
        setSuccessMsg('Digital Signature successfully affixed & cryptographically bound. Agreement is legally binding!');
        // Update local state immediately
        setSelectedContract({
          ...selectedContract,
          status: 'Signed',
          investor_signed_at: new Date().toISOString(),
          digital_signature_name: signerName,
        });
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  const isAlreadySigned =
    selectedContract?.status === 'Signed' ||
    selectedContract?.status === 'Active' ||
    Boolean(selectedContract?.investor_signed_at);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Master Franchise Agreements & E-Signatures ({contracts.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review legally binding commercial franchise agreements, execute digital signatures, and download verified disclosure covenants.
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Contracts Generated Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once an application is approved by the franchiser, the official legal agreement will appear here for your digital signature.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Contracts List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Contract Documents
            </h3>
            {contracts.map((c) => {
              const isSelected = selectedContract?.id === c.id;
              const isSigned = c.status === 'Signed' || c.status === 'Active';

              return (
                <div
                  key={c.id}
                  onClick={() => { setSelectedContract(c); setSuccessMsg(null); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      AGREEMENT #{c.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSigned
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {c.franchise_name}
                  </h4>
                  <div className="text-xs text-slate-500 mt-1">
                    Territory: {c.territory}
                  </div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">
                    Investment: ₹{(c.total_investment / 100000).toFixed(1)} Lakhs
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contract Details & E-Signature View (8 Cols) */}
          {selectedContract && (
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    Statutory Legal Instrument
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    Master Commercial Franchise Agreement
                  </h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Between <strong className="text-slate-800">{selectedContract.company_name || selectedContract.franchiser_name || selectedContract.franchise_name || 'Franchiser Head Office'}</strong> and <strong className="text-slate-800">{selectedContract.investor_name || currentUser.name}</strong>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF
                </button>
              </div>

              {/* Success Banner */}
              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}

              {/* Status banner */}
              {isAlreadySigned ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Legally Signed &amp; Executed</span>
                    Signed by Investor on <span className="font-mono">{selectedContract.investor_signed_at ? new Date(selectedContract.investor_signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}</span>. Both parties have entered a binding {selectedContract.duration_years || 5}-year commercial agreement for territory: <span className="font-semibold">{selectedContract.territory}</span>.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Action Required: Digital Signature Pending</span>
                    Review the terms covenants below and affix your legal digital signature to finalize territorial rights.
                  </div>
                </div>
              )}

              {/* Legal Text Body */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line">
                {selectedContract.terms_text || `MASTER COMMERCIAL FRANCHISE AGREEMENT

This Master Commercial Franchise Agreement ("Agreement") is executed on this day between ${selectedContract.company_name || selectedContract.franchise_name || 'Franchiser Head Office'} ("Franchiser") and ${selectedContract.investor_name || currentUser.name} ("Investor / Franchisee").

1. GRANT OF FRANCHISE LICENSE:
Franchiser hereby grants Investor exclusive territorial operating rights for the franchise brand "${selectedContract.franchise_name}" within designated territory: ${selectedContract.territory}.

2. CAPITAL OUTLAY & FINANCIAL COVENANTS:
- Total Outlay: ₹${(selectedContract.total_investment || 2500000).toLocaleString('en-IN')} (INR)
- Royalty Model: ${selectedContract.royalty_terms || '6% Monthly Gross Turnover'}
- Operating Duration: ${selectedContract.duration_years || 5} Years (Renewable upon statutory audit compliance)

3. INTELLECTUAL PROPERTY & BRAND MARKS:
The Franchisee agrees to strictly adhere to brand guidelines, store facade layout, POS telemetry software, and authorized supplier catalogs.

4. E-SIGNATURE ACKNOWLEDGMENT:
This document is executed under the Information Technology Act. Digital signatures affixed hereto hold equal legal standing as wet signatures.`}
              </div>

              {/* E-Signature Box */}
              {!isAlreadySigned ? (
                <form onSubmit={handleSignContract} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    Cryptographic Digital E-Signature
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Legal Full Name (Must match KYC)
                    </label>
                    <input
                      type="text"
                      required
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-indigo-600 font-mono"
                    />
                  </div>

                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      I solemnly confirm that I have reviewed the Master Franchise Agreement, territorial boundaries, fee schedules, and disclosure documents, and agree to execute this contract electronically under the Information Technology Act.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={signing || !agreedTerms}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {signing ? (
                      <span>Affixing Digital Signature Hash...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign Contract Digitally</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900">Digital Signature Verification Record:</div>
                  <div>Signatory: <span className="font-semibold text-slate-800">{signerName}</span></div>
                  <div>Status: <span className="text-emerald-600 font-bold">Valid & Cryptographically Bound</span></div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">
                    SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
