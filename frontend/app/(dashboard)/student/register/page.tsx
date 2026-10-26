'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { api } from '@/lib/api-client';
import type { EnrollmentDTO, SectionDTO } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Clock, MapPin, Loader2 } from 'lucide-react';

export default function StudentRegisterPage() {
  const [sections, setSections] = useState<SectionDTO[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [sec, enr] = await Promise.all([api.listSections(), api.myEnrollments()]);
      setSections(sec);
      setEnrollments(enr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const enrolledIds = useMemo(
    () => new Set(enrollments.filter((e) => e.status === 'ENROLLED').map((e) => e.sectionId)),
    [enrollments]
  );
  const selected = useMemo(() => sections.filter((s) => enrolledIds.has(s.id)), [sections, enrolledIds]);
  const totalCredits = selected.reduce((sum, s) => sum + s.course.creditUnits, 0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return sections.filter(
      (s) => s.course.code.toLowerCase().includes(q) || s.course.title.toLowerCase().includes(q)
    );
  }, [sections, query]);

  const toggle = (section: SectionDTO) => {
    startTransition(async () => {
      try {
        if (enrolledIds.has(section.id)) {
          await api.drop(section.id);
        } else {
          await api.enroll(section.id);
        }
        await load(); // ዳታውን አድስ
      } catch (e: any) {
        // 👇 የተለያዩ ስህተቶችን ለተጠቃሚው ማሳየት
        const msg = e?.message || '';
        if (msg.includes('Unique constraint') || msg.includes('already')) {
          alert('You are already enrolled in this course.');
        } else if (msg.includes('conflict') || msg.includes('Schedule')) {
          alert('Schedule conflict with another enrolled course.');
        } else if (msg.includes('prerequisite') || msg.includes('Missing')) {
          alert('You do not meet the prerequisites for this course.');
        } else if (msg.includes('hold') || msg.includes('blocked')) {
          alert('Enrollment is blocked due to a hold on your account.');
        } else if (msg.includes('degree') || msg.includes('program')) {
          alert('Course degree level does not match your program level.');
        } else {
          alert(msg || 'Failed to update enrollment');
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 max-w-7xl mx-auto p-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Registration</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((section) => {
              const isEnrolled = enrolledIds.has(section.id);
              const isFull = section.enrolledCount >= section.capacity;
              return (
                <Card
                  key={section.id}
                  className={`overflow-hidden transition-all ${
                    isEnrolled ? 'border-violet-300 bg-violet-50/30' : ''
                  }`}
                >
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">{section.course.code}</h3>
                        <Badge variant="outline">{section.course.creditUnits} Credits</Badge>
                      </div>
                      <p className="text-slate-700 mt-1 font-medium">{section.course.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />{' '}
                          {section.schedule.map((s) => `${s.day} ${s.start}`).join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {section.room || 'TBA'}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => toggle(section)}
                      variant={isEnrolled ? 'destructive' : 'default'}
                      className={!isEnrolled ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}
                    >
                      {isEnrolled ? 'Drop' : isFull ? 'Waitlist' : 'Add'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <div className="h-fit sticky top-6">
        <Card className="bg-slate-900 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">Schedule Summary</h2>
            <div className="space-y-4 mb-8">
              {selected.map((s) => (
                <div key={s.id} className="border-l-2 border-violet-500 pl-4 py-1">
                  <p className="font-semibold text-sm">{s.course.code}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {s.schedule.map((x) => `${x.day} ${x.start}`).join(', ')}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-700 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Credits</span>
                <span>{totalCredits}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}