'use client';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Search, Bell } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-sm font-medium text-slate-500 hidden sm:block">Workspace / Overview</h2>
        <div className="relative w-full max-w-md ml-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search anything..." className="w-full h-9 pl-10 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" />
        </div>
      </div>
      <div className="flex items-center gap-4 ml-6">
        <button className="text-slate-400 hover:text-slate-600"><Bell className="h-5 w-5" /></button>
        {user && <Badge variant="secondary" className="uppercase">{user.role}</Badge>}
      </div>
    </header>
  );
}