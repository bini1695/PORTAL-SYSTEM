'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { GraduationCap, Download, Loader2 } from 'lucide-react';

export default function GradesPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGrades() {
      try {
        const result = await api.getMyGrades();
        setData(result);
      } catch (err: any) {
        console.error('Failed to load grades:', err);
        setError(err.message || 'Failed to load grades');
      } finally {
        setIsLoading(false);
      }
    }
    loadGrades();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const enrollments = data?.enrollments || [];
  const completed = enrollments.filter((e: any) => e.grade);
  
  const totalCredits = completed.reduce((sum: number, e: any) => sum + (e.course?.creditUnits || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grades & Transcript</h1>
          <p className="text-sm text-slate-500 mt-1">View your academic performance and transcript.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors">
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Credits Earned</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{totalCredits}</p>
          </div>
          <div className="p-3 bg-violet-50 rounded-full">
            <GraduationCap className="h-6 w-6 text-violet-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Program</p>
          <p className="text-xl font-bold text-slate-900 mt-2">{data?.student?.program || 'Undeclared'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Student ID</p>
          <p className="text-xl font-bold text-slate-900 mt-2">{data?.student?.studentNumber}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Academic Record</h2>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200">
              <th className="p-4 text-sm font-medium text-slate-600">Course Code</th>
              <th className="p-4 text-sm font-medium text-slate-600">Course Title</th>
              <th className="p-4 text-sm font-medium text-slate-600">Term</th>
              <th className="p-4 text-sm font-medium text-slate-600">Credits</th>
              <th className="p-4 text-sm font-medium text-slate-600 text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((enr: any) => (
              <tr key={enr.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-4 text-sm font-medium text-slate-900">{enr.course.code}</td>
                <td className="p-4 text-sm text-slate-700">{enr.course.title}</td>
                <td className="p-4 text-sm text-slate-600">{enr.term} {enr.academicYear}</td>
                <td className="p-4 text-sm text-slate-600">{enr.course.creditUnits}</td>
                <td className="p-4 text-right">
                  <span className={`px-3 py-1 rounded-md text-sm font-bold ${
                    ['A', 'A-', 'B+', 'B'].includes(enr.grade) ? 'bg-emerald-50 text-emerald-700' :
                    ['B-', 'C+', 'C'].includes(enr.grade) ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {enr.grade}
                  </span>
                </td>
              </tr>
            ))}
            {completed.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No graded courses found. Complete your courses to see grades here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}