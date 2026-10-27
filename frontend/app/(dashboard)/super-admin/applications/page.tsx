'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SuperAdminApplicationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.getAllUsers();
      // 👇 ተማሪ ያልሆኑ እና PENDING የሆኑ ሰዎችን ብቻ ማሳየት
      const pendingStaff = data.filter((u: any) => u.role !== 'STUDENT' && u.accountStatus === 'PENDING');
      setUsers(pendingStaff);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setProcessingId(userId);
    try {
      // ይህንን ለማድረግ በ api-client.ts ውስጥ updateUserStatus የሚል ፈንክሽን መኖር አለበት
      await api.updateUserStatus(userId, newStatus);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Staff Applications</h1>
        <p className="text-slate-500 mt-1">Review and approve new faculty and admin accounts.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No pending staff applications at this time.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-medium text-slate-600">Name</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Email</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Role</th>
                  <th className="p-4 text-sm font-medium text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-900">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{user.email}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleStatusUpdate(user.id, 'SUSPENDED')}
                        disabled={processingId === user.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}
                        disabled={processingId === user.id}
                      >
                        {processingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}