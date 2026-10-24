'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];

export default function SectionRosterPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.id as string;
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, string>>({});

  const loadRoster = async () => {
    try {
      setLoading(true); const data = await api.getSectionRoster(sectionId); setSection(data);
      const initialGrades: Record<string, string> = {};
      data.enrollments.forEach((e: any) => { if (e.grade) initialGrades[e.id] = e.grade; });
      setGrades(initialGrades);
    } catch (err) { alert('Failed to load roster.'); router.push('/faculty'); } finally { setLoading(false); }
  };

  useEffect(() => { loadRoster(); }, [sectionId]);

  const handleGradeSubmit = async (enrollmentId: string) => {
    const grade = grades[enrollmentId];
    if (!grade) return;
    setSavingId(enrollmentId);
    try { await api.submitGrade(enrollmentId, grade); await loadRoster(); } catch (err) { alert('Failed to save grade'); } finally { setSavingId(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  if (!section) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <div><h1 className="text-3xl font-bold">{section.course.code}: {section.course.title}</h1></div>
      <Card>
        <CardHeader><CardTitle>Class Roster</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50"><tr><th className="px-6 py-4">Student</th><th className="px-6 py-4">Current Grade</th><th className="px-6 py-4 text-right">Update</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {section.enrollments.map((e: any) => (
                <tr key={e.id}>
                  <td className="px-6 py-4">{e.student.user.profile?.firstName} {e.student.user.profile?.lastName}</td>
                  <td className="px-6 py-4">{e.grade ? <Badge>{e.grade}</Badge> : <Badge variant="secondary">Not Graded</Badge>}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <select className="h-9 rounded-md border px-2" value={grades[e.id] || ''} onChange={(ev) => setGrades({ ...grades, [e.id]: ev.target.value })}>
                      <option value="" disabled>Select</option>
                      {GRADES.map(g => (<option key={g} value={g}>{g}</option>))}
                    </select>
                    <Button size="sm" onClick={() => handleGradeSubmit(e.id)} disabled={savingId === e.id || !grades[e.id] || grades[e.id] === e.grade} className="bg-violet-600">{savingId === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}