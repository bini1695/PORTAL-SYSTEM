'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Users, Database, BookOpen, ShieldCheck, Loader2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalAuditLogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // ሁሉንም መረጃዎች በአንድ ጊዜ (Parallel) ማምጣት
        const [users, students, courses, logs] = await Promise.all([
          api.getAllUsers().catch(() => []),
          api.getAllStudents().catch(() => []),
          api.getAllCourses().catch(() => []),
          api.getAuditLogs().catch(() => []),
        ]);

        setStats({
          totalUsers: users.length || 0,
          totalStudents: students.length || 0,
          totalCourses: courses.length || 0,
          totalAuditLogs: logs.length || 0,
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500 mt-1">Global overview of your institution's data.</p>
      </div>

      {/* የስታቲስቲክስ ካርዶች */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Registered Students</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalStudents}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Courses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalCourses}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-full">
            <BookOpen className="h-6 w-6 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Audit Logs</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalAuditLogs}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full">
            <Database className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* ፈጣን አገናኞች (Quick Actions) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/super-admin/users" className="p-3 border rounded-lg text-center hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
              Manage Users
            </Link>
            <Link href="/super-admin/settings" className="p-3 border rounded-lg text-center hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
              System Settings
            </Link>
            <Link href="/super-admin/audit" className="p-3 border rounded-lg text-center hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
              View Audit Logs
            </Link>
            <Link href="/admin/courses" className="p-3 border rounded-lg text-center hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
              Manage Courses
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">System Status</h2>
          <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
            <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-medium text-emerald-900">All Systems Operational</p>
              <p className="text-xs text-emerald-600">Database connection is healthy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}