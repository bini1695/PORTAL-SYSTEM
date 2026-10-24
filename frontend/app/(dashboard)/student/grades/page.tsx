'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import type { EnrollmentDTO, InvoiceDTO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { BookOpen, GraduationCap, CheckCircle2, CreditCard, ChevronRight, Loader2, AlertCircle, FileText, Users, Clock, MapPin } from 'lucide-react';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.myEnrollments(), api.myInvoices()])
      .then(([enr, inv]) => {
        setEnrollments(enr);
        setInvoices(inv);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  const active = enrollments.filter((e) => e.status === 'ENROLLED' || e.status === 'WAITLISTED');
  const credits = active.reduce((sum, e) => sum + (e.section?.course.creditUnits ?? 0), 0);
  const outstanding = invoices.filter((i) => i.status !== 'PAID').reduce((s, i) => s + i.amountCents, 0);
  
  // ✅ ለዛሬ የሚሆኑ ክፍሎችን ማውጣት (በቀላሉ የመጀመሪያዎቹን 2 እንወስዳለን)
  const todaysClasses = active.slice(0, 2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, Student</h1>
          <p className="text-slate-500 mt-1">BSc Computer Science · Year 3 · Fall 2026</p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
          <Link href="/student/register">+ Register courses</Link>
        </Button>
      </div>

      {/* Alert Banner */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-violet-600" />
          <div>
            <p className="font-semibold text-violet-900 text-sm">Your next semester starts with a plan.</p>
            <p className="text-xs text-violet-700">Spring 2027 course registration is open. Complete your selection by November 6.</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="bg-white">
          <Link href="/student/register">View course catalog</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Enrolled credits</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{credits} <span className="text-lg text-slate-400">/ 21</span></p>
            <p className="text-xs text-slate-400 mt-1">{active.length} courses in semester</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Cumulative GPA</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">3.72</p>
            <p className="text-xs text-slate-400 mt-1">↑ 0.14 from last semester</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Attendance</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">96%</p>
            <p className="text-xs text-slate-400 mt-1">Above the 75% requirement</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Outstanding fees</p>
            {/* ✅ ከዳታቤዝ የመጣውን ትክክለኛ የዕዳ መጠን ያሳያል */}
            <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(outstanding)}</p>
            <p className="text-xs text-orange-500 mt-1">Next installment: Nov 06</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <CardTitle className="text-lg">My courses</CardTitle>
              <Link href="/student/schedule" className="text-sm text-violet-600 font-medium hover:underline flex items-center">
                Manage enrollment <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {active.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>You are not enrolled in any classes yet.</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/student/register">Browse Course Catalog</Link>
                  </Button>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">Course</th>
                      <th className="px-6 py-3 font-medium">Instructor</th>
                      <th className="px-6 py-3 font-medium">Credits</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {active.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4"><p className="font-medium text-slate-900">{e.section?.course.code} {e.section?.course.title}</p></td>
                        <td className="px-6 py-4 text-slate-600">{e.section?.instructorName || 'TBA'}</td>
                        <td className="px-6 py-4 text-slate-600">{e.section?.course.creditUnits}</td>
                        <td className="px-6 py-4"><Badge variant={e.status === 'ENROLLED' ? 'success' : 'warning'} className={e.status === 'ENROLLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>{e.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Academic Progress & Fees (Bottom Cards) */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Academic progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 mb-2"><p className="text-3xl font-bold">3.72</p><Badge variant="success" className="mb-1">Good standing</Badge></div>
                <p className="text-xs text-slate-500">Degree completion <span className="font-semibold text-slate-800">78 / 120 credits</span></p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-base">Fees & payments</CardTitle><Badge variant="outline" className="text-orange-600 border-orange-200">Due Nov 06</Badge></CardHeader>
              <CardContent>
                {/* ✅ የጠቅላላውን ዕዳ መጠን ያሳያል */}
                <p className="text-2xl font-bold mb-1">{formatCurrency(outstanding)}</p>
                <p className="text-xs text-slate-500">Total outstanding balance</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex justify-between items-center">
                Today's schedule <Link href="/student/schedule" className="text-xs text-violet-600 hover:underline">Timetable →</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {todaysClasses.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No classes scheduled for today.</p>
              ) : (
                todaysClasses.map((e) => {
                  const slot = e.section?.schedule?.[0];
                  return (
                    <div key={e.id} className="flex gap-3">
                      <div className="text-xs font-semibold text-slate-500 w-12 pt-1">
                        {slot?.start || 'TBA'}
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-violet-500">
                        <p className="font-medium text-sm text-slate-900">{e.section?.course.title}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Room {e.section?.room || 'TBA'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100"><CardTitle className="text-base">Campus updates</CardTitle></CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-slate-100 rounded-md"><FileText className="h-4 w-4 text-slate-600" /></div>
                <div><p className="text-sm font-medium text-slate-900">Registration checklist</p><p className="text-xs text-slate-500">2 items due this week</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-slate-100 rounded-md"><Users className="h-4 w-4 text-slate-600" /></div>
                <div><p className="text-sm font-medium text-slate-900">Library hours extended</p><p className="text-xs text-slate-500">Now open until 10 PM</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}