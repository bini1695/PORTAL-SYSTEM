'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Clock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FacultyOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 👇 የ api ክላይንትን ተጠቅመን ዳታውን እናመጣለን (ቶከኑ በራሱ ይጨመራል)
    api.getFacultyOverview()
      .then((resData) => setData(resData))
      .catch((err) => {
        console.error('Failed to load overview:', err);
        setError(err.message || 'Failed to load overview data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium mb-2">Error: {error}</p>
        <p className="text-sm text-slate-500">Please check if the backend is running and you are logged in as Faculty.</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-red-500">No data found.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {data.facultyName || 'Faculty'}</h1>
        <p className="text-slate-500 mt-1">Here is your teaching summary for {data.department}.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-full">
              <BookOpen className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">My Sections</p>
              <p className="text-2xl font-bold text-slate-900">{data.totalSections || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{data.totalStudents || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Department</p>
              <p className="text-xl font-bold text-slate-900">{data.department || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Sections List */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">My Sections</h3>
              <Link href="/faculty/sections" className="text-sm text-violet-600 hover:underline flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {!data.sections || data.sections.length === 0 ? (
                <p className="text-sm text-slate-500">No sections assigned yet.</p>
              ) : (
                data.sections.map((sec: any) => (
                  <div key={sec.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900">{sec.code} - {sec.title}</p>
                      <p className="text-xs text-slate-500">Section {sec.sectionCode} • Room {sec.room || 'TBA'}</p>
                    </div>
                    <div className="text-sm font-semibold text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
                      {sec.students} students
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Enrollments</h3>
            <div className="space-y-4">
              {!data.recentActivity || data.recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity.</p>
              ) : (
                data.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.studentName}</p>
                      <p className="text-xs text-slate-500">Enrolled in {activity.course}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}