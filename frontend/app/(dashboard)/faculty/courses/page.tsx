'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Loader2 } from 'lucide-react';

export default function FacultyCoursesPage() {
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
        <h1 className="text-2xl font-bold text-slate-900">My Courses & Students</h1>
        <p className="text-slate-500">Manage your assigned classes and view rosters.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((sec: any) => {
          const activeStudents = sec.enrollments?.filter((e: any) => e.status === 'ENROLLED').length || 0;
          return (
            <Card key={sec.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{sec.course.code}</h3>
                    <p className="text-sm font-medium text-slate-600">{sec.course.title}</p>
                  </div>
                  <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-md">Sec {sec.sectionCode}</span>
                </div>
                <div className="space-y-2 mb-6 text-sm text-slate-600">
                  <p className="flex items-center"><Users className="h-4 w-4 mr-2 text-slate-400" /> {activeStudents} Students Enrolled</p>
                  <p className="flex items-center"><BookOpen className="h-4 w-4 mr-2 text-slate-400" /> {sec.term} {sec.academicYear}</p>
                </div>
                <Button asChild className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  <Link href={`/faculty/sections/${sec.id}`}>View Roster & Grades</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {sections.length === 0 && (<p className="col-span-full text-center py-8 text-slate-500">No courses assigned yet.</p>)}
      </div>
    </div>
  );
}