import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';
import { ShieldCheck, History, RefreshCw } from 'lucide-react';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Security & Regulatory Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable audit record of digital e-signatures, fee payments, algorithmic decision evaluations, and contract issuances.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Audit Trail Clean & Active</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No audit incidents logged yet. As platform users execute digital contract e-signatures, fee settlements, and regulatory disclosures, cryptographic log entries will be preserved here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5">Log ID</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Details / Context</th>
                  <th className="p-3.5">Initiating User / Email</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 text-[11px]">
                    <td className="p-3.5 font-bold text-indigo-700">LOG-{log.id}</td>
                    <td className="p-3.5 font-sans font-semibold text-slate-900">{log.action}</td>
                    <td className="p-3.5 font-sans text-slate-700">{log.details}</td>
                    <td className="p-3.5 font-sans text-slate-600">{log.user_email || `User #${log.user_id || 'System'}`}</td>
                    <td className="p-3.5 text-slate-500">{log.ip_address}</td>

                    <td className="p-3.5 text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
