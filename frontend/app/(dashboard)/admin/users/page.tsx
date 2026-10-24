'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' });

  const fetchUsers = async () => {
    try { setLoading(true); const data = await api.getAllUsers(); setUsers(data); } 
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await api.register(formData);
      setIsModalOpen(false); setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' }); fetchUsers();
    } catch (err: any) { alert(err.message || 'Failed to create user'); } finally { setIsSubmitting(false); }
  };

  const filtered = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.profile?.firstName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-900">User Management</h1><p className="text-slate-500">Manage all accounts.</p></div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4 mr-2" /> Add User</Button>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100"><div className="relative w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <CardContent className="p-0">
          {loading ? (<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Email</th><th className="px-6 py-4 font-medium">Role</th><th className="px-6 py-4 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.profile?.firstName} {u.profile?.lastName}</td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4"><Badge variant="outline">{u.role}</Badge></td>
                    <td className="px-6 py-4"><Badge variant={u.accountStatus === 'ACTIVE' ? 'success' : 'warning'}>{u.accountStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><Label>First Name</Label><Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div><div className="space-y-1.5"><Label>Last Name</Label><Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" required minLength={8} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Role</Label><select className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}><option value="STUDENT">Student</option><option value="FACULTY">Faculty</option><option value="BURSAR">Bursar</option><option value="ADMIN">Admin</option></select></div>
              <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create User'}</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}