'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { GraduationCap, Download, Loader2, Award, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  // 👇 ከባክኤንዱ የሚመጣውን 'courses' ተጠቀም
  const courses = data?.courses || [];
  const totalCredits = data?.totalCredits || 0;
  const gpa = data?.gpa || '0.00';

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-violet-200 mb-1">
              <Award className="h-4 w-4" />
              <p className="text-sm font-medium">Cumulative GPA</p>
            </div>
            <p className="text-4xl font-bold">{gpa}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Credits Earned</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalCredits}</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-full">
              <GraduationCap className="h-6 w-6 text-violet-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Program</p>
            <p className="text-xl font-bold text-slate-900 mt-2">{data?.student?.program || 'Undeclared'}</p>
            <p className="text-xs text-slate-500">{data?.student?.degreeLevel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Academic Record</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Course Code</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Course Title</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Term</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Credits</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.course.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{c.course.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.term} {c.academicYear}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.course.creditUnits}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-3 py-1 rounded-md text-sm font-bold ${
                        ['A', 'A-', 'B+', 'B'].includes(c.grade) ? 'bg-emerald-50 text-emerald-700' :
                        ['B-', 'C+', 'C'].includes(c.grade) ? 'bg-amber-50 text-amber-700' :
                        c.grade === 'N/A' ? 'bg-slate-100 text-slate-500' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {c.grade}
                      </span>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No graded courses found. Complete your courses to see grades here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}