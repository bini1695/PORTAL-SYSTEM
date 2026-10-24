'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Layers, ArrowRight, Loader2, Plus, TrendingUp, Clock, GraduationCap } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, courses: 0, sections: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ዳታውን ከ Backend ማምጣት
    Promise.all([api.getAllStudents(), api.getAllCourses(), api.getAllSections()])
      .then(([students, courses, sections]) => {
        setStats({
          students: students.length,
          courses: courses.length,
          sections: sections.length,
          pending: students.filter((s: any) => s.status === 'PENDING').length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time overview of your institution.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/applications')} variant="outline">
            Review Applications
          </Button>
          <Button onClick={() => router.push('/admin/users')} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Total Students</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.students}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Active Courses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.courses}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Active Sections</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.sections}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Pending Applications</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-600" /> Enrollment Trend
            </h3>
            <div className="h-48 bg-slate-50 rounded-lg flex items-end justify-around p-4 border border-slate-100">
              <div className="w-8 bg-violet-300 rounded-t" style={{ height: '40%' }}></div>
              <div className="w-8 bg-violet-400 rounded-t" style={{ height: '60%' }}></div>
              <div className="w-8 bg-violet-500 rounded-t" style={{ height: '55%' }}></div>
              <div className="w-8 bg-violet-600 rounded-t" style={{ height: '80%' }}></div>
              <div className="w-8 bg-violet-700 rounded-t" style={{ height: '95%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
              <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" /> Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">New student approved</p>
                  <p className="text-xs text-slate-500">2 min ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Course created</p>
                  <p className="text-xs text-slate-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/applications">
          <Card className="hover:border-violet-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-6">
              <Users className="h-6 w-6 text-violet-600 mb-3" />
              <CardTitle className="text-base">Review Applications</CardTitle>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                Manage now <ArrowRight className="h-3 w-3 ml-1" />
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/courses">
          <Card className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-6">
              <BookOpen className="h-6 w-6 text-emerald-600 mb-3" />
              <CardTitle className="text-base">Manage Courses</CardTitle>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                Manage now <ArrowRight className="h-3 w-3 ml-1" />
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/sections">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-6">
              <Layers className="h-6 w-6 text-blue-600 mb-3" />
              <CardTitle className="text-base">Manage Sections</CardTitle>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                Manage now <ArrowRight className="h-3 w-3 ml-1" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}