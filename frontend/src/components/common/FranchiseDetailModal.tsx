import React, { useState } from 'react';
import { FranchiseListing, User } from '../../types';
import { GISLocationHeatmap } from './GISLocationHeatmap';
import { FinancialSensitivitySimulator } from '../investor/FinancialSensitivitySimulator';

import {
  X,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  Percent,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Calculator,
  Send,
  Lock,
  Star,
  Users,
  GitCompare,
  Eye,
  Sparkles
} from 'lucide-react';

interface FranchiseDetailModalProps {
  isOpen?: boolean;
  franchise: FranchiseListing | null;
  currentUser: User | null;
  onClose: () => void;
  onRunFeasibility: (franchise: FranchiseListing) => void;
  onApply: (franchise: FranchiseListing) => void;
  onStartChat?: (franchise: FranchiseListing) => void;
  onOpenScheduleMeeting?: (franchise: FranchiseListing) => void;
  onOpenAuth?: (mode?: 'login' | 'register', role?: 'investor' | 'franchiser' | 'admin') => void;
  isComparing?: boolean;
  onToggleCompare?: (franchise: FranchiseListing) => void;
}

export const FranchiseDetailModal: React.FC<FranchiseDetailModalProps> = ({
  isOpen = true,
  franchise,
  currentUser,
  onClose,
  onRunFeasibility,
  onApply,
  onStartChat,
  onOpenScheduleMeeting,
  onOpenAuth,
  isComparing = false,
  onToggleCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'gallery' | 'financials' | 'royalties' | 'licenses' | 'documents' | 'challenges' | 'territories' | 'reviews' | 'gis' | 'sensitivity'>('breakdown');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [modalViewingDoc, setModalViewingDoc] = useState<any | null>(null);

  if (isOpen === false || !franchise) return null;

  const isSoldOut = franchise.status === 'Sold Out' || franchise.available_units <= 0;
  const isInvestor = currentUser?.role === 'investor';

  const galleryImages = Array.from(new Set([
    franchise.image_url,
    ...(franchise.images || [])
  ].filter(Boolean))).slice(0, 10) as string[];

  const brandDocuments = franchise.documents || [];




  const renderInvestorGate = (featureTitle: string, featureDesc: string) => (
    <div className="p-6 sm:p-10 bg-gradient-to-br from-slate-950 via-[#0B132B] to-indigo-950 text-white rounded-3xl border border-indigo-500/30 shadow-2xl text-center space-y-5 my-3 animate-fade-in relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center mx-auto shadow-inner relative z-10">
        <Lock className="w-7 h-7 text-indigo-400" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5 relative z-10">
        <span className="px-3 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black rounded-full uppercase tracking-widest inline-block">
          🔒 Verified Investor Profile Required
        </span>
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
          {featureTitle} Gated
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {featureDesc} Create a free Investor Profile or sign in to unlock complete statutory files and Decision Support System (FDSS) analytics.
        </p>
      </div>

      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-lg mx-auto text-left space-y-2 relative z-10 text-xs text-slate-300">
        <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Verified Investor Profile Unlocks:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Statutory Certificates &amp; Lightbox</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>GIS Footfall Demand Heatmap</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Stress Test &amp; Sensitivity Engine</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>5-Yr P&amp;L Financial Forecasts</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 relative z-10">
        <button
          onClick={() => onOpenAuth && onOpenAuth('register', 'investor')}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Create Free Investor Profile</span>
        </button>

        <button
          onClick={() => onOpenAuth && onOpenAuth('login')}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <span>Sign In to Existing Account</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );

  const handleInspectDoc = (doc: any) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('register', 'investor');
      return;
    }
    setModalViewingDoc(doc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-[96vw] max-w-6xl h-[88vh] max-h-[820px] border border-slate-700/80 overflow-hidden relative my-auto flex flex-col">
        
        {/* HERO HEADER */}
        <div className="py-3 px-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            {galleryImages.length > 0 ? (
              <img
                src={galleryImages[0]}
                alt={franchise.name}
                className="w-12 h-12 rounded-xl object-cover border border-indigo-400/40 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0 border border-indigo-400/30">
                {franchise.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {franchise.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-400/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>✓ VERIFIED LISTING</span>
                </span>
                {isSoldOut && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-400/40">
                    SOLD OUT
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2 font-medium mt-0.5">
                <span className="text-white font-bold">{franchise.company_name}</span>
                <span>•</span>
                <span>{franchise.business_type}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {franchise.headquarters}
                </span>
                <span>•</span>
                <span>Founded {franchise.founded_year}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODERN PILL NAVIGATION BAR */}
        <div className="py-2 px-4 bg-slate-900 border-b border-slate-800 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-none text-xs font-bold text-slate-300">
          {[
            { id: 'breakdown', label: 'Investment & CapEx', icon: DollarSign },
            { id: 'gis', label: 'GIS Location Heatmap', icon: MapPin, highlight: true, gated: true },
            { id: 'sensitivity', label: 'Stress Test Engine', icon: Calculator, highlight: true, gated: true },
            { id: 'documents', label: 'Statutory Certificates', icon: ShieldCheck, badge: brandDocuments.length, gated: true },
            { id: 'gallery', label: 'Reference Photos', icon: Layers, badge: galleryImages.length },
            { id: 'royalties', label: 'Royalty & Split', icon: Percent, gated: true },
            { id: 'financials', label: '5-Yr Financials', icon: TrendingUp, gated: true },
            { id: 'territories', label: 'Territory Units', icon: MapPin, badge: franchise.territories?.length || 0, gated: true },
            { id: 'reviews', label: 'Investor Reviews', icon: Star, badge: franchise.reviews?.length || 0, gated: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isTabLocked = !currentUser && tab.gated;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 text-xs font-bold ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : tab.highlight
                    ? 'bg-indigo-950/80 text-indigo-200 hover:bg-indigo-900 border border-indigo-700/60'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isTabLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm">
          {/* TAB: GIS LOCATION HEATMAP & DEMAND */}
          {activeTab === 'gis' && (
            !currentUser ? (
              renderInvestorGate(
                'GIS Location Heatmap & Footfall Analytics',
                'Interactive demand zone heatmaps, competition radial analysis, and footfall density statistics are reserved for verified investor profiles.'
              )
            ) : (
              <div className="space-y-4">
                <GISLocationHeatmap franchise={franchise} />
              </div>
            )
          )}

          {/* TAB: STATUTORY CERTIFICATES & COMPLIANCE VAULT */}
          {activeTab === 'documents' && (
            !currentUser ? (
              renderInvestorGate(
                'Statutory Certificates & Compliance Vault',
                'Audited statutory GST certificates, FSSAI licenses, and incorporation CIN filings are restricted to registered investor profiles.'
              )
            ) : (
              <div className="space-y-5 font-sans">
                <div className="p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/40">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                        <span>{franchise.name} Verified Statutory Certificates</span>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-full uppercase tracking-wider">✓ Admin Audited</span>
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Statutory filings audited and verified by platform legal counsel. Click any certificate image to inspect in full resolution.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {brandDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-200 space-y-4 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          {/* Interactive Image Thumbnail */}
                          <div
                            onClick={() => handleInspectDoc(doc)}
                            className="relative w-24 h-18 rounded-2xl overflow-hidden border-2 border-slate-300 shrink-0 cursor-pointer group bg-slate-900 shadow-sm"
                            title="Click to view high resolution document image"
                          >
                            <img src={doc.file_url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-black uppercase text-indigo-600 tracking-wider block">
                              {doc.doc_type}
                            </span>
                            <h4 className="font-black text-slate-900 text-sm sm:text-base mt-1 line-clamp-2" title={doc.title}>
                              {doc.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 font-medium truncate">
                              {doc.issuing_authority}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl text-xs sm:text-sm font-mono border border-slate-200 flex items-center justify-between text-slate-700">
                          <span>Ref: <strong className="text-slate-900 font-extrabold">{doc.number}</strong></span>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-sans text-xs font-black">
                            ✓ Admin Verified
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-semibold">High-Res Statutory Asset</span>
                        <button
                          onClick={() => handleInspectDoc(doc)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition shadow-md flex items-center gap-2 hover:scale-[1.02]"
                        >
                          <Eye className="w-4 h-4 text-white" />
                          <span>Inspect Image</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* TAB SENSITIVITY: FINANCIAL STRESS TEST SIMULATOR */}
          {activeTab === 'sensitivity' && (
            !currentUser ? (
              renderInvestorGate(
                'Financial Sensitivity Stress Test Engine',
                'Monte Carlo cash-flow simulations, occupancy cost sensitivity, and revenue stress testing are restricted to registered investors.'
              )
            ) : (
              <div className="space-y-4">
                <FinancialSensitivitySimulator franchise={franchise} />
              </div>
            )
          )}

          {/* TAB 1: INVESTMENT BREAKDOWN & TAXES */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                    Total Estimated Outlay (Base + Taxes)
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    ₹{(franchise.total_investment_est / 100000).toFixed(2)} Lakhs
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Includes GST ({franchise.gst_rate}%) on fees & equipment setup.
                  </div>
                </div>
                <div className="text-xs text-slate-600 sm:text-right">
                  <div>Model: <span className="font-semibold text-slate-800">{franchise.business_model}</span></div>
                  <div>Units Left: <span className="font-semibold text-emerald-600">{franchise.available_units} of {franchise.total_units}</span></div>
                </div>
              </div>

              {/* Breakdown Table Gating */}
              {!currentUser ? (
                <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/30 text-white text-center space-y-3 shadow-md font-sans">
                  <div className="flex items-center justify-center gap-2 text-indigo-300 font-extrabold text-sm">
                    <Lock className="w-4.5 h-4.5 text-amber-400" />
                    <span>Itemized CapEx Breakdown &amp; Tax ITC Telemetry is Locked</span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                    Itemized store fit-out costs, equipment OEMs, license procurement fees, and GST Input Tax Credit (ITC) telemetry are restricted for public visitors.
                  </p>
                  <button
                    onClick={() => onOpenAuth && onOpenAuth('register', 'investor')}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black text-xs rounded-xl transition shadow-lg inline-flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Create Free Investor Profile to Unlock</span>
                  </button>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Capital Expenditure (CapEx) & Working Capital Breakdown
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                        <tr>
                          <th className="p-3">Investment Component</th>
                          <th className="p-3">Amount (INR)</th>
                          <th className="p-3">Remarks / Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Franchise Brand License Fee</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.franchise_fee.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">Non-refundable upfront franchise trademark rights</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Store Setup & Architecture</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.setup_cost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">Turnkey store architectural drawings & fit-out supervision</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Machinery & Commercial Equipment</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.equipment_cost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">Procured from verified OEMs with 1-year warranty</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Interior Fit-Out & Signage</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.interior_cost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">Standardized brand facade, acoustics, and client lounge</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Working Capital Reserve</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.working_capital.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">Initial 3-4 months payroll and raw material inventory</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Staff Training & Onboarding</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.training_cost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">Certified training modules at Franchiser headquarters</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Technology & POS Deployment</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.tech_cost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">Cloud ERP, POS hardware, inventory telemetry setup</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-900">Statutory License Procurement</td>
                          <td className="p-3 font-semibold text-slate-900">₹{franchise.license_cost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">FSSAI, Health trade license, fire NOC, municipal fees</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="p-3 text-slate-900">Estimated Base Total</td>
                          <td className="p-3 text-slate-900">₹{(franchise.total_investment_est).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-emerald-700">Detailed in Franchise Disclosure Document (FDD)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Operational Reference Photos Preview */}
              {galleryImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Store &amp; Operational Reference Photos ({galleryImages.length} Photos)
                    </h4>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      View Full Gallery ({galleryImages.length}) &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {galleryImages.slice(0, 4).map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveImageIndex(idx);
                          setActiveTab('gallery');
                        }}
                        className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 cursor-pointer group shadow-2xs hover:shadow-md transition"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {idx === 3 && galleryImages.length > 4 && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-xs">
                            +{galleryImages.length - 4} Photos
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Disclosure */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-900 block mb-1">
                  Tax Registration &amp; Applicable Levies:
                </span>
                All capital asset purchases and franchise license fees are subject to statutory GST at 18.0%. Input Tax Credit (ITC) can be claimed by the investor upon registration with state GST authorities. Franchiser Tax Identification: <span className="font-mono text-slate-800">{franchise.tax_gst_number || '29AABCB1234F1Z8'}</span>.
              </div>
            </div>
          )}

          {/* TAB: REFERENCE PHOTOS & VISUAL GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Franchise Operational Reference Photos ({galleryImages.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified storefront exterior, interior design layout, equipment setup, and customer experience.
                  </p>
                </div>
              </div>

              {galleryImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Large Featured Image */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 aspect-video max-h-[360px] flex items-center justify-center">
                    <img
                      src={galleryImages[activeImageIndex] || galleryImages[0]}
                      alt={`${franchise.name} Reference ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent text-white flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-sm block">{franchise.name}</span>
                        <span className="text-xs text-slate-300">
                          Image {activeImageIndex + 1} of {galleryImages.length} • Commercial Reference Photo
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg">
                        VERIFIED BRAND MEDIA
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-1">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative rounded-xl overflow-hidden aspect-video border-2 transition ${
                          activeImageIndex === idx
                            ? 'border-indigo-600 ring-2 ring-indigo-300 shadow-md scale-105'
                            : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500">No reference images uploaded for this franchise listing yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ROYALTIES & REVENUE SHARING */}
          {activeTab === 'royalties' && (
            !currentUser ? (
              renderInvestorGate(
                'Royalty Split & Platform Fee Schedule',
                'Itemized brand royalty breakdown, marketing fund split, and POS telemetry fees are reserved for registered investors.'
              )
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Primary Model</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{franchise.royalty_type}</div>
                    <div className="text-sm font-extrabold text-indigo-600 mt-0.5">
                      {franchise.royalty_type === 'Fixed Royalty' ? `₹${franchise.royalty_value.toLocaleString('en-IN')} / month` : `${franchise.royalty_value}% of Gross Turnover`}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Payable on or before the 5th of each calendar month.
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Marketing & Brand Fund</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{franchise.marketing_fee}% of Revenue</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Allocated to centralized national digital campaigns, influencer marketing, and brand promotions.
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Technology & Cloud Fee</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{franchise.tech_fee}% of Revenue</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Includes cloud POS access, mobile ordering app integration, inventory ERP, and loyalty program.
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Listing & Platform Maintenance</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">₹{franchise.maintenance_fee.toLocaleString('en-IN')} / mo</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Status: <span className="font-semibold text-emerald-600">{franchise.maintenance_fee_status}</span> (Verified by Admin).
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Other Recurring Charges:</span>
                  <p className="text-slate-600">{franchise.other_recurring_fees}</p>
                </div>
              </div>
            )
          )}

          {/* TAB 3: FINANCIAL PROJECTIONS */}
          {activeTab === 'financials' && (
            !currentUser ? (
              renderInvestorGate(
                '5-Year Financial Projections & Payback',
                'Detailed 60-month P&L forecasts, gross margin schedules, and break-even timelines are locked for public visitors.'
              )
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-[11px] text-slate-500 font-medium">Est. Monthly Revenue</div>
                    <div className="text-base font-extrabold text-slate-900 mt-0.5">
                      ₹{(franchise.est_monthly_revenue / 100000).toFixed(2)}L
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-[11px] text-slate-500 font-medium">Est. Monthly Expenses</div>
                    <div className="text-base font-extrabold text-slate-600 mt-0.5">
                      ₹{(franchise.est_monthly_expenses / 100000).toFixed(2)}L
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-[11px] text-emerald-800 font-medium">Est. Monthly Profit</div>
                    <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                      ₹{(franchise.est_monthly_profit / 100000).toFixed(2)}L
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="text-[11px] text-indigo-800 font-medium">Projected Annual ROI</div>
                    <div className="text-base font-extrabold text-indigo-700 mt-0.5">
                      {franchise.est_roi}% p.a.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Operational Payback Timeline
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Estimated complete capital recovery is achieved in <span className="font-bold text-slate-900">{franchise.payback_months} months</span> under standard average ticket size and customer footfall assumptions.
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Operational Break-Even
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Store is modeled to reach operational cash break-even by <span className="font-bold text-slate-900">Month {franchise.breakeven_months}</span> following store grand launch and inaugural local campaigns.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB 4: SECTOR LICENSES & STATUTORY CLEARANCES */}
          {activeTab === 'licenses' && (
            !currentUser ? (
              renderInvestorGate(
                'Sector Regulatory Clearance Dossier',
                'Regulatory clearance lead times, municipal permit costs, and statutory compliance status are restricted to verified investors.'
              )
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50/50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        Sector Regulatory Clearance Dossier
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        Statutory permissions, municipal clearances, and industry operating permits required for {franchise.name}.
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-white text-emerald-800 border border-emerald-300 font-extrabold text-[10px] rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0 shadow-2xs">
                    ✓ Verified by Admin Audit
                  </span>
                </div>

                {franchise.licenses && franchise.licenses.length > 0 ? (
                  <div className="space-y-3">
                    {franchise.licenses.map((lic, idx) => (
                      <div key={idx} className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs shrink-0">
                              📜
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">{lic.license_name}</h4>
                              <div className="text-xs text-slate-500 font-medium">
                                Issuing Body: <strong className="text-slate-800">{lic.issuing_authority}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{lic.verification_status || 'Verified'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 border border-slate-100 font-medium text-slate-700">
                          <div>
                            <span className="text-slate-400 text-[11px] block">Est. Licensing Cost:</span>
                            <span className="font-extrabold text-slate-900">₹{lic.estimated_cost?.toLocaleString('en-IN') || '15,000'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Acquisition Lead Time:</span>
                            <span className="font-extrabold text-indigo-700">~{lic.acquisition_time_weeks} Weeks</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Filing Party:</span>
                            <span className="font-semibold text-slate-800">{lic.responsible_party}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 font-semibold text-sky-800">
                            <Lock className="w-3 h-3 text-sky-600" />
                            <span>🌐 Publicly Visible &amp; Immutable Audit Record</span>
                          </span>
                          <span className="font-mono text-emerald-700 font-bold">Ref: REG-VERIFIED-{idx + 101}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                    No additional sector licenses recorded for this brand.
                  </div>
                )}
              </div>
            )
          )}

          {/* TAB 5: CHALLENGES & MITIGATIONS */}
          {activeTab === 'challenges' && (
            !currentUser ? (
              renderInvestorGate(
                'Risk Challenges & Franchiser Mitigations',
                'Operational bottlenecks, supply chain risks, and standardized franchiser mitigation strategies are restricted.'
              )
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  Industry-specific operational bottlenecks and standardized mitigation strategies:
                </div>

                {franchise.challenges && franchise.challenges.length > 0 ? (
                  <div className="space-y-3">
                    {franchise.challenges.map((ch, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Risk Challenge: {ch.challenge_title}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">{ch.description}</p>
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-900 leading-relaxed">
                          <span className="font-bold text-emerald-800">Franchiser Mitigation Strategy: </span>
                          {ch.mitigation_strategy}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                    No sector-specific challenges published.
                  </div>
                )}
              </div>
            )
          )}

          {/* TAB 6: TERRITORIES */}
          {activeTab === 'territories' && (
            !currentUser ? (
              renderInvestorGate(
                'Territory Units & Exclusive Zones',
                'Designated expansion territories, city reservation status, and exclusive operational maps are gated.'
              )
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  Designated geographic expansion territories and exclusive operational zones:
                </div>

                {franchise.territories && franchise.territories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {franchise.territories.map((t, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{t.territory_name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {t.city}, {t.state} ({t.country})
                          </div>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {t.is_exclusive ? 'Exclusive Territory' : 'Non-Exclusive'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          t.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'Reserved'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                    No explicit territories published.
                  </div>
                )}
              </div>
            )
          )}

          {/* TAB 7: REVIEWS */}
          {activeTab === 'reviews' && (
            !currentUser ? (
              renderInvestorGate(
                'Investor Reviews & Franchisee Ratings',
                'Audited franchisee reviews, communication ratings, and support satisfaction scores are restricted.'
              )
            ) : (
              <div className="space-y-4">
                {franchise.reviews && franchise.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {franchise.reviews.map((r, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-slate-900 text-xs">{r.investor_name || 'Verified Investor'}</div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{r.overall_rating} / 5.0</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-[11px] text-slate-500">
                          <span>Communication: <strong className="text-slate-800">{r.communication_rating}</strong></span>
                          <span>Transparency: <strong className="text-slate-800">{r.transparency_rating}</strong></span>
                          <span>Support: <strong className="text-slate-800">{r.support_rating}</strong></span>
                          <span>ROI Realization: <strong className="text-slate-800">{r.roi_rating}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                    No investor reviews posted yet for this listing.
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* FOOTER ACTIONS BAR */}
        <div className="py-2.5 px-4 bg-slate-950 border-t border-slate-800 text-white flex flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-slate-200">
              Units: <strong className="text-white font-extrabold">{franchise.available_units}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(franchise)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
                  isComparing
                    ? 'bg-emerald-600 text-white border border-emerald-500'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{isComparing ? 'In Compare' : '+ Compare'}</span>
              </button>
            )}

            {currentUser ? (
              <>
                <button
                  onClick={() => onRunFeasibility(franchise)}
                  className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-sky-400" />
                  <span>Run Feasibility (DSS)</span>
                </button>

                <button
                  onClick={() => onStartChat && onStartChat(franchise)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Chat Franchiser</span>
                </button>

                <button
                  onClick={() => onOpenScheduleMeeting && onOpenScheduleMeeting(franchise)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-300" />
                  <span>Schedule Meeting</span>
                </button>

                <button
                  disabled={isSoldOut}
                  onClick={() => onApply(franchise)}
                  className={`px-5 py-2 font-black text-xs rounded-xl transition shadow-lg flex items-center gap-1.5 ${
                    isSoldOut
                      ? 'bg-rose-900/80 text-rose-200 cursor-not-allowed border border-rose-700/60'
                      : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSoldOut ? 'Sold Out (Quota Fully Subscribed)' : 'Apply / Express Interest'}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('register', 'investor')}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black text-xs rounded-xl transition shadow-lg flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Create Investor Profile to Unlock</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HIGH-RES DOCUMENT IMAGE LIGHTBOX MODAL */}
        {modalViewingDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden relative my-auto max-h-[95vh] flex flex-col text-xs">
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                    <Eye className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{modalViewingDoc.title}</h3>
                    <p className="text-[10.5px] text-slate-400">
                      Statutory Document Inspection • {modalViewingDoc.issuing_authority || 'Govt Compliance Body'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalViewingDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Image Lightbox Container */}
              <div className="p-4 sm:p-6 bg-slate-950 flex-1 flex items-center justify-center overflow-auto min-h-[400px]">
                <img
                  src={modalViewingDoc.file_url}
                  alt={modalViewingDoc.title}
                  className="max-h-[68vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800"
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Statutory Certificate Image Verified by Admin</span>
                </div>
                <button
                  onClick={() => setModalViewingDoc(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
