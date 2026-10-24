'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Receipt, Clock, FileText, Download, ArrowUpRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BursarDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBillingStats(), api.getBillingInvoices()])
      .then(([statsData, invoicesData]) => {
        setStats(statsData);
        setInvoices(invoicesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Overview</h1>
          <p className="text-slate-500 mt-1 text-sm">Fall 2026 · A clear view of collections, balances and student support</p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
          <Link href="/bursar/invoices">+ Manage Invoices</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm border-l-4 border-l-violet-500"><CardContent className="p-5 flex justify-between items-start"><div><p className="text-sm font-medium text-slate-500">Fees Collected</p><p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(stats.totalCollected)}</p><p className="text-xs text-emerald-600 font-medium mt-1 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1"/> + 12.8%</p></div><DollarSign className="h-6 w-6 text-violet-400" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm border-l-4 border-l-amber-500"><CardContent className="p-5 flex justify-between items-start"><div><p className="text-sm font-medium text-slate-500">Outstanding Balance</p><p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(stats.outstanding)}</p><p className="text-xs text-slate-500 mt-1">Across all accounts</p></div><Clock className="h-6 w-6 text-amber-400" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-start"><div><p className="text-sm font-medium text-slate-500">Overdue Invoices</p><p className="text-3xl font-bold text-slate-900 mt-2">{stats.overdueCount}</p><p className="text-xs text-slate-500 mt-1">Requires immediate action</p></div><Receipt className="h-6 w-6 text-slate-300" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-start"><div><p className="text-sm font-medium text-slate-500">Total Invoices</p><p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalInvoices}</p><p className="text-xs text-slate-500 mt-1">Issued this semester</p></div><FileText className="h-6 w-6 text-slate-300" /></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Invoices Table */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg">Recent Student Invoices</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-violet-600">
              <Link href="/bursar/invoices">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr><th className="px-6 py-3 font-medium">Student / Invoice</th><th className="px-6 py-3 font-medium">Total Billed</th><th className="px-6 py-3 font-medium">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.slice(0, 5).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{inv.student.user.profile?.firstName} {inv.student.user.profile?.lastName}</p>
                      <p className="text-xs text-slate-500">{inv.number}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatCurrency(inv.amountCents)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'destructive' : 'warning'}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (<tr><td colSpan={3} className="text-center py-8 text-slate-500">No invoices found.</td></tr>)}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Fee Structure */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100"><CardTitle className="text-base flex justify-between items-center">Fee Structure <Button variant="ghost" size="sm" className="h-6 text-xs text-violet-600">Edit</Button></CardTitle><p className="text-xs text-slate-500">BSc Computer Science · Fall 2026</p></CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600"><span>Tuition</span><span className="font-medium text-slate-900">$5,400</span></div>
              <div className="flex justify-between text-slate-600"><span>Technology & lab fee</span><span className="font-medium text-slate-900">$550</span></div>
              <div className="flex justify-between text-slate-600"><span>Student services</span><span className="font-medium text-slate-900">$300</span></div>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-slate-900"><span>Semester total</span><span>$6,250</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}