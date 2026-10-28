'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Receipt, LogOut, User as UserIcon,
  Users, Layers, CreditCard, FileText, CalendarDays,
  ClipboardList, Megaphone, BarChart3, GraduationCap, Settings, Database, HelpCircle, X
} from 'lucide-react';

const navItems = {
  STUDENT: [
    { href: '/student', label: 'Overview', icon: LayoutDashboard },
    { href: '/student/register', label: 'Course Registration', icon: BookOpen },
    { href: '/student/schedule', label: 'Timetable', icon: CalendarDays },
    { href: '/student/grades', label: 'Grades & Transcript', icon: GraduationCap },
    { href: '/student/invoices', label: 'Fees & Payments', icon: Receipt },
    { href: '/student/profile', label: 'Profile & Documents', icon: UserIcon },
  ],
  ADMIN: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/courses', label: 'Courses & Programs', icon: BookOpen },
    { href: '/admin/sections', label: 'Sections', icon: Layers },
    { href: '/admin/applications', label: 'Approvals', icon: ClipboardList },
    { href: '/admin/grade-changes', label: 'Grade Changes', icon: FileText }, // 👈 አዲስ
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  ],
  FACULTY: [
    { href: '/faculty', label: 'Overview', icon: LayoutDashboard },
    { href: '/faculty/courses', label: 'My Courses & Students', icon: BookOpen },
    { href: '/faculty/gradebook', label: 'Gradebook', icon: ClipboardList },
    { href: '/faculty/attendance', label: 'Attendance', icon: FileText },
    { href: '/faculty/grade-change', label: 'Request Grade Change', icon: FileText }, // 👈 አዲስ
  ],
  REGISTRAR: [
    { href: '/registrar', label: 'Overview', icon: LayoutDashboard },
    { href: '/registrar/grade-changes', label: 'Grade Changes', icon: ClipboardList },
  ],
  BURSAR: [
    { href: '/bursar', label: 'Overview', icon: LayoutDashboard },
    { href: '/bursar/invoices', label: 'Invoices', icon: CreditCard },
    { href: '/bursar/payments', label: 'Payment Tracking', icon: Receipt },
    { href: '/bursar/reports', label: 'Reports & Receipts', icon: FileText },
  ],
  SUPER_ADMIN: [
    { href: '/super-admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/super-admin/users', label: 'User Management', icon: Users },
    { href: '/super-admin/settings', label: 'Settings', icon: Settings },
    { href: '/super-admin/audit', label: 'Audit Logs', icon: Database },
  ],
};

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role;
  const links = role ? navItems[role as keyof typeof navItems] || [] : [];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white shrink-0">
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 text-violet-700 font-bold text-lg tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
            <BookOpen className="h-4 w-4" />
          </div>
         INU
        </Link>
        
        {/* 👇 በሞባይል ብቻ የሚታይ የመዝጊያ ቁልፍ */}
        <button onClick={onClose} className="md:hidden p-1 text-slate-500 hover:bg-slate-100 rounded">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</div>
        <nav className="space-y-1 px-3">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={onClose} // ሊንኩን ሲጫኑ ማውጫው ይዘጋ
                className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}
              >
                <Icon className={cn("h-4 w-4", active ? "text-violet-700" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
          <div className="flex items-center gap-2 text-slate-700 font-medium text-xs mb-1">
            <HelpCircle className="h-4 w-4 text-slate-400" /> A little guidance?
          </div>
          <p className="text-[10px] text-slate-500">Our campus support team is here to help.</p>
          <Link href="#" className="text-[10px] font-semibold text-violet-600 mt-1 block hover:underline">Visit help center →</Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold uppercase">
            {user?.email?.substring(0, 2) || 'US'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-slate-500 uppercase">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}