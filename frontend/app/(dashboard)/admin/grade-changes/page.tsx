'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminGradeChangeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingGradeChanges();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
    try {
      await api.reviewGradeChange(id, status);
      loadRequests();
    } catch (err) {
      alert('Failed to review request');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Grade Change Requests</h1>
        <p className="text-slate-500 mt-1">Review and approve grade changes submitted by faculty.</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No pending requests.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Course</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Old → New</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Reason</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {req.enrollment.student.user.profile?.firstName} {req.enrollment.student.user.profile?.lastName}
                    </td>
                    <td className="px-4 py-3">{req.enrollment.section.course.code}</td>
                    <td className="px-4 py-3">
                      <span className="line-through text-red-400 mr-2">{req.oldGrade}</span>
                      <span className="font-bold text-emerald-600">{req.newGrade}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{req.reason}</td>
                    <td className="px-4 py-3 flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReview(req.id, 'REJECTED')}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" className="bg-emerald-600" onClick={() => handleReview(req.id, 'APPROVED')}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}