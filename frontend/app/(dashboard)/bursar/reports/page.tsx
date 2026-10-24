'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BursarReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBillingStats(), api.getAllPayments()])
      .then(([statsData, paymentsData]) => {
        setStats(statsData);
        setPayments(paymentsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // የሪፖርት ማውረድ (CSV)
  const handleExportReport = () => {
    const csvContent = [
      ['Payment ID', 'Invoice #', 'Student', 'Amount (USD)', 'Date Paid', 'Method'],
      ...payments.map(p => [
        p.id,
        p.invoice.number,
        `${p.invoice.student.user.profile?.firstName} ${p.invoice.student.user.profile?.lastName}`,
        (p.amountCents / 100).toFixed(2),
        new Date(p.paidAt).toLocaleDateString(),
        p.method || 'N/A',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Receipts</h1>
          <p className="text-slate-500">Financial summaries and official payment receipts.</p>
        </div>
        <Button onClick={handleExportReport} className="bg-slate-900 text-white hover:bg-slate-800">
          <Download className="h-4 w-4 mr-2" /> Export Report (CSV)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">Total Collected</p><p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(stats?.totalCollected || 0)}</p></div><DollarSign className="h-8 w-8 text-emerald-200" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">Outstanding</p><p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(stats?.outstanding || 0)}</p></div><TrendingUp className="h-8 w-8 text-amber-200" /></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">Total Invoices</p><p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalInvoices || 0}</p></div><FileText className="h-8 w-8 text-slate-300" /></CardContent></Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg">Recent Payment Receipts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date Paid</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 text-right font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{p.invoice.student.user.profile?.firstName} {p.invoice.student.user.profile?.lastName}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{p.invoice.number}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">{formatCurrency(p.amountCents)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(p.paidAt)}</td>
                  <td className="px-6 py-4"><Badge variant="outline">{p.method || 'CASH'}</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> PDF</Button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No payments recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}