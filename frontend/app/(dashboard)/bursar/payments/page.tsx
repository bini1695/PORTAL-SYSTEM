'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BursarPaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [amount, setAmount] = useState(0);

  // ደረሰኞችን ማምጣት
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getBillingInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ክፍያ መመዝገብ
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return alert('Select an invoice');
    
    setIsSubmitting(true);
    try {
      await api.recordPayment({
        invoiceId: selectedInvoice.id,
        amountCents: Number(amount) * 100, // ወደ ሳንቲም
        method: 'CASH',
      });
      setIsModalOpen(false);
      setAmount(0);
      setSelectedInvoice(null);
      await loadData(); // ዳታውን አድስ
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Tracking</h1>
          <p className="text-slate-500">Monitor student transactions and record new payments.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Record Payment
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {inv.student.user.profile?.firstName} {inv.student.user.profile?.lastName}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{inv.number}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(inv.amountCents)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      inv.status === 'PAID' ? 'success' :
                      inv.status === 'PARTIALLY_PAID' ? 'warning' : 'destructive'
                    }>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Select Invoice</Label>
                <select
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={selectedInvoice?.id || ''}
                  onChange={(e) => {
                    const inv = invoices.find(i => i.id === e.target.value);
                    setSelectedInvoice(inv);
                  }}
                >
                  <option value="">-- Choose an invoice --</option>
                  {invoices.filter(i => i.status !== 'PAID').map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.student.user.profile?.firstName} {inv.student.user.profile?.lastName} - {inv.number} ({formatCurrency(inv.amountCents)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount Paid ($)</Label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}