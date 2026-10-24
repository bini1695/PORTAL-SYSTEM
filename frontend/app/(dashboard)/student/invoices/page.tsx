'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { InvoiceDTO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, FileText } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.myInvoices().then(setInvoices).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  const outstanding = invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.amountCents, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div><h1 className="text-3xl font-bold">Fees & Invoices</h1></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white border-0 shadow-lg">
          <CardContent className="p-6"><p className="text-violet-200 font-medium text-sm">Total Outstanding Balance</p><p className="text-4xl font-bold mt-2">{formatCurrency(outstanding)}</p></CardContent>
        </Card>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader><CardTitle className="text-lg">Invoice History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (<p className="text-center py-8 text-slate-500">No invoices found.</p>) : (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><FileText className="h-5 w-5" /></div>
                    <div><p className="font-medium text-slate-900 font-mono">{inv.number}</p><p className="text-xs text-slate-500">Due {formatDate(inv.dueDate)}</p></div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="font-bold text-slate-900">{formatCurrency(inv.amountCents)}</p>
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}