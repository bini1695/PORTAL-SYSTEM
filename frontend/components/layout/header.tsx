'use client';

import { Menu, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { NotificationDropdown } from './notification-dropdown'; // 👈 አዲስ የተጨመረ

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* 👇 በሞባይል ብቻ የሚታይ ምናው ቁልፍ */}
        <button 
          onClick={onMenuClick}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <h2 className="hidden md:block text-sm font-medium text-slate-500">
          Workspace / Overview
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* 👇 በሞባይል ላይ የፍለጋ ምልክት ብቻ ይታያል */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-violet-300 focus:bg-white"
          />
        </div>
        
        {/* 👇 በሞባይል ላይ የፍለጋ አዶ */}
        <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100 md:hidden">
          <Search className="h-5 w-5" />
        </button>

        {/* 👇 አዲሱ የማሳወቂያ ኮምፖኔንት */}
        <NotificationDropdown />

        {/* 👇 የተጠቃሚው ሮል በቀኝ በኩል (ለዴስክቶፕ) */}
        <div className="flex items-center gap-2 ml-2">
          <span className="hidden md:inline-flex text-xs font-semibold bg-violet-100 text-violet-700 px-3 py-1 rounded-full uppercase">
            {user?.role || 'USER'}
          </span>
          <div className="md:hidden h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold uppercase text-xs">
            {user?.email?.substring(0, 2) || 'US'}
          </div>
        </div>
      </div>
    </header>
  );
}