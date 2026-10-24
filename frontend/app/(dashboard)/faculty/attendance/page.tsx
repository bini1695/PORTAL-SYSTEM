'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Loader2 } from 'lucide-react';

export default function FacultyAttendancePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFacultySections()
      .then(data => setSections(data.sections || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="text-slate-500">Record student attendance for your classes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((sec: any) => (
          <Card key={sec.id} className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600"><CalendarDays className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-slate-900">{sec.course.code}</p>
                  <p className="text-xs text-slate-500">Sec {sec.sectionCode}</p>
                </div>
              </div>
              <Button asChild size="sm" variant="secondary"><Link href={`/faculty/sections/${sec.id}`}>Take Attendance</Link></Button>
            </CardContent>
          </Card>
        ))}
        {sections.length === 0 && (<p className="col-span-full text-center py-8 text-slate-500">No courses assigned yet.</p>)}
      </div>
    </div>
  );
}