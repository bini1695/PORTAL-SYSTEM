'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, FileText, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BursarInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // የፎርም ስቴት
  const [formData, setFormData] = useState({
    studentId: '',
    amountCents: 0,
    dueDate: '',
    description: '',
  });

  // 1. ዳታውን ከ Backend ማምጣት
  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, studData] = await Promise.all([
        api.getBillingInvoices(),
        api.getAllStudents(),
      ]);
      setInvoices(invData);
      setStudents(studData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. አዲስ ደረሰኝ መፍጠር
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return alert('Please select a student');
    
    setIsSubmitting(true);
    try {
      await api.createInvoice({
        studentId: formData.studentId,
        amountCents: Number(formData.amountCents) * 100, // ወደ ሳንቲም መቀየር
        dueDate: formData.dueDate,
        description: formData.description,
      });
      setIsModalOpen(false);
      setFormData({ studentId: '', amountCents: 0, dueDate: '', description: '' });
      await loadData(); // ዝርዝሩን አድስ
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Invoices</h1>
          <p className="text-slate-500">Manage billing, payments, and receipts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Invoice
        </Button>
      </div>

      {/* Invoices Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {inv.student.user.profile?.firstName} {inv.student.user.profile?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{inv.student.studentNumber}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{inv.number}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(inv.amountCents)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'destructive' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No invoices found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Invoice</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Select Student</Label>
                <select
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-violet-500"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                >
                  <option value="">-- Choose a student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user.firstName} {s.user.lastName} ({s.studentNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={formData.amountCents}
                  onChange={(e) => setFormData({ ...formData, amountCents: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input
                  placeholder="e.g., Tuition fee for Fall 2026"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}