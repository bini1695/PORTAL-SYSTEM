'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ApplicationsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const data = await api.getAllStudents();
      // 👇 የ PENDING ተማሪዎችን ብቻ ማሳየት (አድሚን የሚያጸድቀው ይህንን ብቻ ነው)
      const pendingStudents = data.filter((s: any) => s.status === 'PENDING');
      setStudents(pendingStudents);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStatusUpdate = async (studentId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setProcessingId(studentId);
    try {
      await api.updateStudentStatus(studentId, newStatus);
      
      // 👇 ሲጸድቅ ወይም ሲጦም ከስክሪኑ ላይ ማጥፋት (ምክንያቱም ከእንግዲህ PENDING አይደለም)
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Student Applications</h1>
        <p className="text-slate-500 mt-1">Review and approve new student registrations.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No pending student applications at this time.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-medium text-slate-600">Student Name</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Email</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="p-4 text-sm font-medium text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-900">
                        {student.user?.firstName} {student.user?.lastName}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {student.user?.email}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleStatusUpdate(student.id, 'SUSPENDED')}
                        disabled={processingId === student.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleStatusUpdate(student.id, 'ACTIVE')}
                        disabled={processingId === student.id}
                      >
                        {processingId === student.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Approve
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