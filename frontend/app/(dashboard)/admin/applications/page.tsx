'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminApplicationsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAction = async (id: string, status: 'ACTIVE' | 'WITHDRAWN') => {
    setActionLoading(id);
    try {
      await api.updateStudentStatus(id, status);
      await fetchStudents(); // ዝርዝሩን አድስ
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Applications</h1>
        <p className="text-slate-500">Review and approve new student onboarding requests.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">ID Number</th>
                <th className="px-6 py-4 font-medium">Program</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{s.user?.firstName} {s.user?.lastName}</p>
                    <p className="text-xs text-slate-500">{s.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{s.studentNumber}</td>
                  <td className="px-6 py-4 text-slate-600">{s.program}</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : s.status === 'PENDING' ? 'warning' : 'destructive'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {s.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          disabled={actionLoading === s.id}
                          onClick={() => handleAction(s.id, 'ACTIVE')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {actionLoading === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === s.id}
                          onClick={() => handleAction(s.id, 'WITHDRAWN')}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">No student applications found.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}