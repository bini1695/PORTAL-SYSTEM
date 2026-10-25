'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  if (isLoading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading audit logs...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Track all system activities and user actions.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-medium text-slate-600">Timestamp</th>
              <th className="p-4 text-sm font-medium text-slate-600">Action</th>
              <th className="p-4 text-sm font-medium text-slate-600">Entity</th>
              <th className="p-4 text-sm font-medium text-slate-600">Performed By</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-4 text-sm">
                  <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}
                </td>
                <td className="p-4 text-sm">
                  {log.user ? (
                    <div>
                      <p className="text-slate-900 font-medium">{log.user.email}</p>
                      <p className="text-xs text-slate-500">{log.user.role}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">System / Deleted User</span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}