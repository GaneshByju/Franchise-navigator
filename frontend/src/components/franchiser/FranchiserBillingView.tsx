import React, { useState } from 'react';
import { FranchiseListing, User, PaymentRecord } from '../../types';
import { api } from '../../services/api';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  Receipt,
  Zap,
  TrendingUp
} from 'lucide-react';
import { FranchisePaymentModal } from '../common/FranchisePaymentModal';

interface FranchiserBillingViewProps {
  listings: FranchiseListing[];
  currentUser: User;
  onRefresh: () => void;
}

export const FranchiserBillingView: React.FC<FranchiserBillingViewProps> = ({
  listings,
  currentUser,
  onRefresh,
}) => {
  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    paymentType: 'Listing Fee' | 'Monthly Maintenance' | 'Package Upgrade';
    relatedName: string;
    franchiseId?: number;
  }>({
    isOpen: false,
    title: '',
    amount: 0,
    paymentType: 'Listing Fee',
    relatedName: '',
  });

  const [activePackage, setActivePackage] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');

  const paidListingsCount = listings.filter((l) => l.listing_fee_paid === 1).length;
  const totalListingFeesSettled = paidListingsCount * 5000;
  const activeMaintenanceCount = listings.filter((l) => l.maintenance_fee_status === 'Paid').length;
  const monthlyMaintenanceTotal = activeMaintenanceCount * 1500;

  const handleOpenPayment = (
    title: string,
    amount: number,
    paymentType: 'Listing Fee' | 'Monthly Maintenance' | 'Package Upgrade',
    relatedName: string,
    franchiseId?: number
  ) => {
    setPaymentModalState({
      isOpen: true,
      title,
      amount,
      paymentType,
      relatedName,
      franchiseId,
    });
  };

  const handlePaymentSuccess = async (txnRef: string) => {
    if (paymentModalState.franchiseId) {
      if (paymentModalState.paymentType === 'Listing Fee') {
        await api.payListingFee(paymentModalState.franchiseId);
      } else if (paymentModalState.paymentType === 'Monthly Maintenance') {
        await api.payMaintenanceFee(paymentModalState.franchiseId);
      }
    }
    onRefresh();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Listing Packages & Platform Maintenance Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage commercial brand listing fees, statutory GST invoices, catalog hosting maintenance, and tier passes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Franchiser Account
          </span>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Published Brands</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {listings.length} <span className="text-xs font-medium text-slate-500">Outlets Listed</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {paidListingsCount} Verified &amp; Listed
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Catalog Maintenance</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            ₹{monthlyMaintenanceTotal.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ mo</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeMaintenanceCount} Brands Paid &amp; Active in Search
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Statutory Fees Paid</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            ₹{totalListingFeesSettled.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Includes 18% statutory GST receipts
          </div>
        </div>
      </div>

      {/* FRANCHISE LISTING FEE SCHEDULE */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Standard Franchiser Listing &amp; Catalog Maintenance Fees
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent flat-fee structure for single brand listing and catalog hosting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ONE-TIME LISTING FEE CARD */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold uppercase text-indigo-700">Listing Onboarding Fee</span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">One-Time Fee</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                ₹5,000 <span className="text-xs font-normal text-slate-500">/ one-time listing fee (+ 18% GST)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Statutory onboarding and Admin statutory document verification fee for your 1 brand listing.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>1 Verified Franchise Brand Opportunity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Statutory Certificate Audit &amp; Verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Direct Encrypted Chat &amp; Meeting Scheduler</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
              ✓ Payable once upon brand creation
            </div>
          </div>

          {/* MONTHLY MAINTENANCE CARD */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold uppercase text-emerald-700">Catalog Directory Maintenance</span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">Monthly Fee</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                ₹1,500 <span className="text-xs font-normal text-slate-500">/ month (+ 18% GST)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ongoing directory hosting, search engine index priority, and investor inquiry routing.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Active Live Placement on Marketplace</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>24/7 Investor Application Inbox &amp; Legal Docs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Automated GST Tax Invoices Generated</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
              ✓ Billed monthly per active listing
            </div>
          </div>
        </div>
      </div>

      {/* BRAND MAINTENANCE INVOICES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Brand Listing Fee &amp; Monthly Maintenance Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Settle one-time listing fees and monthly directory maintenance to keep your brands active in investor search results.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Brand Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Listing Fee (One-Time)</th>
                <th className="p-3">Monthly Maintenance</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((l) => {
                const isListingFeePaid = l.listing_fee_paid === 1;
                const isMaintenancePaid = l.maintenance_fee_status === 'Paid';

                return (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{l.name}</td>
                    <td className="p-3 text-slate-600">{l.business_type}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        isListingFeePaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isListingFeePaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isListingFeePaid ? 'Paid (₹5,000)' : 'Pending Fee'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        isMaintenancePaid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isMaintenancePaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {isMaintenancePaid ? 'Paid (₹1,500/mo)' : 'Due (₹1,500)'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {!isListingFeePaid && (
                        <button
                          onClick={() =>
                            handleOpenPayment(
                              `Pay Listing Fee: ${l.name}`,
                              5000,
                              'Listing Fee',
                              l.name,
                              l.id
                            )
                          }
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] transition"
                        >
                          Pay Listing Fee
                        </button>
                      )}

                      {!isMaintenancePaid && (
                        <button
                          onClick={() =>
                            handleOpenPayment(
                              `Pay Monthly Maintenance: ${l.name}`,
                              1500,
                              'Monthly Maintenance',
                              l.name,
                              l.id
                            )
                          }
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[11px] transition"
                        >
                          Pay Maintenance
                        </button>
                      )}

                      {isListingFeePaid && isMaintenancePaid && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ✓ All Fees Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      <FranchisePaymentModal
        isOpen={paymentModalState.isOpen}
        onClose={() => setPaymentModalState({ ...paymentModalState, isOpen: false })}
        title={paymentModalState.title}
        amount={paymentModalState.amount}
        paymentType={paymentModalState.paymentType}
        relatedName={paymentModalState.relatedName}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
