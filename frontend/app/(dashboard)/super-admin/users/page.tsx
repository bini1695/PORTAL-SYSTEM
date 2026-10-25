'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // አዲስ ተጠቃሚ ለመፍጠር የሚያገለግል State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    role: 'STUDENT',
    firstName: '',
    lastName: ''
  });

  // 1. ተጠቃሚዎችን ከዳታቤዝ ማምጣት
  const fetchUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. አዲስ ተጠቃሚ መፍጠር
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser(newUser);
      setIsModalOpen(false);
      setNewUser({ email: '', password: '', role: 'STUDENT', firstName: '', lastName: '' });
      fetchUsers(); // ዝርዝሩን አድስ
    } catch (error: any) {
      alert(error.message || 'Failed to create user');
    }
  };

  // 3. ስታተስ መቀየር (ACTIVE / SUSPENDED)
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateUserStatus(id, newStatus);
      fetchUsers();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  // 4. ፓስወርድ ሪሴት ማድረግ
  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password for this user:');
    if (!newPassword) return;
    
    try {
      await api.resetUserPassword(id, newPassword);
      alert('Password reset successfully!');
    } catch (error) {
      alert('Failed to reset password');
    }
  };

  // 5. ተጠቃሚ ማጥፋት
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user permanently?')) return;
    
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all accounts and permissions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-medium text-slate-600">User</th>
              <th className="p-4 text-sm font-medium text-slate-600">Role</th>
              <th className="p-4 text-sm font-medium text-slate-600">Status</th>
              <th className="p-4 text-sm font-medium text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-4">
                  <p className="text-sm font-medium text-slate-900">
                    {u.profile?.firstName} {u.profile?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <select 
                    className={`border rounded-md p-1.5 text-xs font-medium focus:outline-none focus:ring-2 ${
                      u.accountStatus === 'ACTIVE' 
                        ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200 focus:ring-red-200'
                    }`}
                    value={u.accountStatus}
                    onChange={(e) => handleStatusChange(u.id, e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </td>
                <td className="p-4 text-sm text-right space-x-3">
                  <button 
                    onClick={() => handleResetPassword(u.id)} 
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors"
                  >
                    Reset Password
                  </button>
                  <button 
                    onClick={() => handleDelete(u.id)} 
                    className="text-red-600 hover:text-red-800 font-medium text-xs transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No users found in the system.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newUser.firstName} 
                    onChange={e => setNewUser({...newUser, firstName: e.target.value})} 
                    className="w-full border border-slate-300 p-2 rounded-md text-sm focus:border-violet-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newUser.lastName} 
                    onChange={e => setNewUser({...newUser, lastName: e.target.value})} 
                    className="w-full border border-slate-300 p-2 rounded-md text-sm focus:border-violet-500 focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  className="w-full border border-slate-300 p-2 rounded-md text-sm focus:border-violet-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                <input 
                  type="text" 
                  required 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  className="w-full border border-slate-300 p-2 rounded-md text-sm focus:border-violet-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})} 
                  className="w-full border border-slate-300 p-2 rounded-md text-sm focus:border-violet-500 focus:outline-none"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="REGISTRAR">REGISTRAR</option>
                  <option value="BURSAR">BURSAR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}