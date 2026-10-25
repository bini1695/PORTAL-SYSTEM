'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function ApprovalsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      const data = await api.getAllStudents();
      setStudents(data);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (studentId: string) => {
    try {
      await api.updateStudentStatus(studentId, 'ACTIVE');
      fetchApplications();
    } catch (error: any) {
      alert(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (studentId: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      await api.updateStudentStatus(studentId, 'WITHDRAWN');
      fetchApplications();
    } catch (error: any) {
      alert(error.message || 'Failed to reject');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading applications...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve new student onboarding requests.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-medium text-slate-600">Student Name</th>
              <th className="p-4 text-sm font-medium text-slate-600">ID Number</th>
              <th className="p-4 text-sm font-medium text-slate-600">Program</th>
              <th className="p-4 text-sm font-medium text-slate-600">Status</th>
              <th className="p-4 text-sm font-medium text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-4">
                  <p className="text-sm font-medium text-slate-900">
                    {student.user?.profile?.firstName || 'N/A'} {student.user?.profile?.lastName || ''}
                  </p>
                  <p className="text-xs text-slate-500">{student.user?.email}</p>
                </td>
                <td className="p-4 text-sm text-slate-600">{student.studentNumber}</td>
                <td className="p-4 text-sm text-slate-600">{student.program}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    student.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 
                    student.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 
                    'bg-red-50 text-red-700'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {/* ቁልፎቹ ሁልጊዜ እንዲታዩ ተደርጓል */}
                  <button 
                    onClick={() => handleApprove(student.id)}
                    disabled={student.status === 'ACTIVE'}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      student.status === 'ACTIVE' 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(student.id)}
                    disabled={student.status === 'WITHDRAWN'}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      student.status === 'WITHDRAWN' 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No student applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}