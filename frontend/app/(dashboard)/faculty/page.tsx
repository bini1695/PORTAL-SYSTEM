'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getFacultySections()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, {data.facultyName}</h1>
          <p className="text-slate-500 mt-1">Department of {data.department} · Fall 2026</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg">+ Create announcement</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">My Courses</p><p className="text-3xl font-bold text-slate-900 mt-2">{data.totalCourses}</p></div><BookOpen className="h-8 w-8 text-violet-200" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">Enrolled Students</p><p className="text-3xl font-bold text-slate-900 mt-2">{data.totalStudents}</p></div><Users className="h-8 w-8 text-blue-200" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">Grading to Complete</p><p className="text-3xl font-bold text-slate-900 mt-2">{data.pendingGrades}</p></div><FileText className="h-8 w-8 text-amber-200" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">Average Attendance</p><p className="text-3xl font-bold text-slate-900 mt-2">93.4%</p></div><CheckCircle2 className="h-8 w-8 text-emerald-200" /></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <div className="flex flex-row items-center justify-between p-6 pb-4 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">My Courses</h3></div>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="px-6 py-3 font-medium">Course & Section</th><th className="px-6 py-3 font-medium">Students</th><th className="px-6 py-3 font-medium">Next Class</th><th className="px-6 py-3 font-medium text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {data.sections?.map((sec: any) => {
                    const activeStudents = sec.enrollments?.filter((e: any) => e.status === 'ENROLLED').length || 0;
                    const nextClass = sec.schedule && sec.schedule.length > 0 ? sec.schedule[0] : null;
                    return (
                      <tr key={sec.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4"><p className="font-medium text-slate-900">{sec.course.code}: {sec.course.title}</p><p className="text-xs text-slate-500">Section {sec.sectionCode} · {sec.course.creditUnits} Credits</p></td>
                        <td className="px-6 py-4">{activeStudents}</td>
                        <td className="px-6 py-4 text-slate-600">{nextClass ? `${nextClass.day} · ${nextClass.start}` : 'TBA'}</td>
                        <td className="px-6 py-4 text-right"><Button asChild size="sm" variant="outline" className="text-violet-600 border-violet-200 hover:bg-violet-50"><Link href={`/faculty/sections/${sec.id}`}>Open course <ChevronRight className="h-4 w-4 ml-1" /></Link></Button></td>
                      </tr>
                    );
                  })}
                  {(!data.sections || data.sections.length === 0) && (<tr><td colSpan={4} className="text-center py-8 text-slate-500">You are not assigned to any courses yet.</td></tr>)}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-violet-50/50">
            <div className="p-6 pb-3 border-b border-violet-100"><h3 className="text-base font-bold text-violet-900">Up next</h3></div>
            <CardContent className="pt-4">
              {data.sections && data.sections.length > 0 ? (
                <div className="bg-white p-4 rounded-lg border border-violet-100 shadow-sm border-l-4 border-l-violet-500">
                  <p className="text-xs font-semibold text-violet-600 mb-1">Today</p>
                  <p className="font-bold text-slate-900">{data.sections[0].course.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{data.sections[0].schedule?.[0]?.start} - {data.sections[0].schedule?.[0]?.end} · Room {data.sections[0].room || 'TBA'}</p>
                  <Button asChild className="w-full mt-3 bg-violet-600 hover:bg-violet-700" size="sm">
                    <Link href={`/faculty/sections/${data.sections[0].id}`}>Mark attendance</Link>
                  </Button>
                </div>
              ) : (<p className="text-sm text-slate-500">No upcoming classes.</p>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}