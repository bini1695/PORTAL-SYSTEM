'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, HardDrive, Activity, Users, Settings } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div><h1 className="text-3xl font-bold">System Administration</h1></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Total Users</p><p className="text-3xl font-bold mt-2">13,842</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Role Requests</p><p className="text-3xl font-bold mt-2">8</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">System Uptime</p><p className="text-3xl font-bold mt-2">99.98%</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Last Backup</p><p className="text-3xl font-bold mt-2">02:00 AM</p></CardContent></Card>
      </div>
    </div>
  );
}