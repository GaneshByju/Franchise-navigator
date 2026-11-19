import React, { useState } from 'react';
import { User, FranchiseListing } from '../../types';
import {
  Users,
  CheckCircle2,
  Search,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';

interface AdminUsersViewProps {
  users: User[];
  franchises: FranchiseListing[];
  onRefresh: () => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ users, franchises, onRefresh }) => {
  const [filterRole, setFilterRole] = useState<'all' | 'investor' | 'franchiser'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Exclude admin accounts — they are platform operators, not managed users
  const nonAdminUsers = users.filter((u) => u.role !== 'admin');

  const filtered = nonAdminUsers.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Helper: get all listings for a franchiser user
  const getListingsForUser = (userId: number) =>
    franchises.filter((f) => f.franchiser === userId || (f as any).franchiser_id === userId);

  // Helper: billing summary for a franchiser
  const getBillingSummary = (userId: number) => {
    const listings = getListingsForUser(userId);
    if (listings.length === 0) return null;
    const overdue = listings.filter((f) => f.maintenance_fee_status === 'Overdue').length;
    const grace = listings.filter((f) => f.maintenance_fee_status === 'Grace Period').length;
    const paid = listings.filter((f) => f.maintenance_fee_status === 'Paid').length;
    const totalCollected = listings.reduce((sum, f) => {
      return sum +
        (f.listing_fee_status === 'Paid' ? (f.listing_fee_amount || 0) : 0) +
        (f.maintenance_fee_status === 'Paid' ? (f.maintenance_fee || 0) : 0);
    }, 0);
    return { listings: listings.length, overdue, grace, paid, totalCollected };
  };

  // Summary stats
  const overdueCount = franchises.filter((f) => f.maintenance_fee_status === 'Overdue').length;
  const graceCount = franchises.filter((f) => f.maintenance_fee_status === 'Grace Period').length;

  return (
    <div className="space-y-6">
      {/* Revenue Alert Banner */}
      {(overdueCount > 0 || graceCount > 0) && (
        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border font-semibold text-xs ${
          overdueCount > 0
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-amber-50 border-amber-300 text-amber-800'
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {overdueCount > 0 && <><strong>{overdueCount} listing{overdueCount > 1 ? 's' : ''} OVERDUE</strong> on monthly maintenance. </>}
            {graceCount > 0 && <><strong>{graceCount} listing{graceCount > 1 ? 's' : ''}</strong> in Grace Period — payment due soon.</>}
            {' '}Go to <strong>Franchise Directory</strong> to take action.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Account Management & Verification ({nonAdminUsers.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Oversee accredited investors and verified franchisers registered on the platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-indigo-600"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-600"
          >
            <option value="all">All Roles</option>
            <option value="investor">Investors</option>
            <option value="franchiser">Franchisers</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Profile Context</th>
                <th className="p-3.5">Billing Status</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const profile = u.profile as any;
                const billing = u.role === 'franchiser' ? getBillingSummary(u.id) : null;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-500 text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'franchiser'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {u.role === 'investor' && (
                        <span>
                          {profile?.min_budget && profile?.max_budget
                            ? `Budget: ₹${(profile.min_budget / 100000).toFixed(1)}L–₹${(profile.max_budget / 100000).toFixed(1)}L`
                            : 'Budget: Dynamic criteria'}
                          {profile?.plan_type ? ` • ${profile.plan_type} Plan` : ''}
                        </span>
                      )}
                      {u.role === 'franchiser' && (
                        <span>
                          {profile?.company_name ? profile.company_name : u.name}
                          {profile?.gst_number ? ` • GST: ${profile.gst_number}` : ''}
                        </span>
                      )}
                    </td>

                    {/* BILLING STATUS COLUMN */}
                    <td className="p-3.5">
                      {u.role === 'investor' && (
                        <span className="text-slate-400 text-[11px]">N/A — Investor</span>
                      )}
                      {u.role === 'franchiser' && !billing && (
                        <span className="text-slate-400 text-[11px]">No listings yet</span>
                      )}
                      {u.role === 'franchiser' && billing && (
                        <div className="space-y-1">
                          {/* Overdue alert */}
                          {billing.overdue > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold w-max">
                              <AlertTriangle className="w-3 h-3" />
                              {billing.overdue} Overdue
                            </span>
                          )}
                          {/* Grace period */}
                          {billing.grace > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold w-max">
                              ⚠ {billing.grace} Grace Period
                            </span>
                          )}
                          {/* All paid */}
                          {billing.overdue === 0 && billing.grace === 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold w-max">
                              <CheckCircle2 className="w-3 h-3" /> All Paid
                            </span>
                          )}
                          {/* Total collected */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            ₹{billing.totalCollected.toLocaleString('en-IN')} collected • {billing.listings} listing{billing.listings > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> Verified KYC
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {u.created_at}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No users found. Investors and franchisers will appear here once they register.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
