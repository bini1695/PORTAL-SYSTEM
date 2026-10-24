'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { EnrollmentDTO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;

export default function SchedulePage() {
  const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.myEnrollments().then((data) => setEnrollments(data.filter((e) => e.status === 'ENROLLED'))).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div><h1 className="text-3xl font-bold">My Timetable</h1></div>
      <div className="grid gap-4 md:grid-cols-5">
        {DAYS.map((day) => {
          const slots = enrollments.flatMap((e) => (e.section?.schedule ?? []).filter((s) => s.day === day).map((s) => ({ ...s, course: e.section!.course })));
          return (
            <Card key={day}><CardHeader className="bg-slate-50 border-b py-3"><CardTitle className="text-sm text-center">{day}</CardTitle></CardHeader>
              <CardContent className="p-3 space-y-3 min-h-[200px]">{slots.map((slot, i) => (<div key={i} className="rounded-lg border bg-violet-50 p-3 text-xs"><p className="font-bold">{slot.course.code}</p><p>{slot.start} - {slot.end}</p></div>))}</CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}