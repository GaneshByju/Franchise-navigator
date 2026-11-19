import React from 'react';
import { FranchiseListing } from '../../types';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

interface AdminPlatformRevenueViewProps {
  franchises: FranchiseListing[];
}

export const AdminPlatformRevenueView: React.FC<AdminPlatformRevenueViewProps> = ({ franchises }) => {
  const paidListingFeeBrands = franchises.filter((f) => f.listing_fee_status === 'Paid');
  const paidMaintenanceBrands = franchises.filter((f) => f.maintenance_fee_status === 'Paid');

  const listingFeeTotal = paidListingFeeBrands.length * 5000;
  const maintenanceMonthlyTotal = paidMaintenanceBrands.length * 1500;
  const investorSubscriptionsTotal = 9999 * 6; // 6 active premium/pro investors
  const grossPlatformAnnualRunRate = listingFeeTotal + maintenanceMonthlyTotal * 12 + investorSubscriptionsTotal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Platform Monetization & Revenue Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed platform financial model tracking one-time brand listing fees (₹5,000), monthly directory maintenance fees (₹1,500/mo), and accredited investor tier subscriptions.
        </p>
      </div>

      {/* REVENUE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">One-Time Brand Listing Fees</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1.5">
            ₹{(listingFeeTotal / 1000).toFixed(0)},000
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {paidListingFeeBrands.length} Brands @ ₹5,000 per statutory registration
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Monthly Maintenance Inflow</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1.5">
            ₹{(maintenanceMonthlyTotal / 1000).toFixed(0)},000 <span className="text-xs font-normal text-slate-400">/ mo</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {paidMaintenanceBrands.length} Active brands @ ₹1,500/mo catalog hosting
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Annualized Run Rate (ARR)</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1.5">
            ₹{(grossPlatformAnnualRunRate / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Including investor annual subscription revenue
          </div>
        </div>
      </div>

      {/* PLATFORM TRANSACTION LEDGER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          Monetized Fee Settlement Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Brand / Payer</th>
                <th className="p-3">Revenue Stream</th>
                <th className="p-3">Tariff Schedule</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {franchises.map((f) => (
                <React.Fragment key={f.id}>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{f.name}</td>
                    <td className="p-3 text-slate-600">Brand Listing Fee</td>
                    <td className="p-3 text-slate-500">One-time regulatory onboarding</td>
                    <td className="p-3 font-bold text-slate-900">₹{f.listing_fee_amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        ✓ {f.listing_fee_status}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                    <td className="p-3 font-semibold text-slate-900">{f.name}</td>
                    <td className="p-3 text-slate-600">Monthly Catalog Maintenance</td>
                    <td className="p-3 text-slate-500">Directory index & search matching</td>
                    <td className="p-3 font-bold text-slate-900">₹{f.maintenance_fee}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        ✓ {f.maintenance_fee_status}
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
