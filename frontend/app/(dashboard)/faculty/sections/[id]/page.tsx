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
      setLoading(true); 
      const data = await api.getSectionRoster(sectionId); 
      setSection(data);
      
      // 👇 ነባር ውጤቶችን ወደ State መሙላት
      const initialGrades: Record<string, string> = {};
      data.enrollments.forEach((e: any) => { 
        if (e.grade) initialGrades[e.id] = e.grade; 
      });
      setGrades(initialGrades);
    } catch (err) { 
      alert('Failed to load roster.'); 
      router.push('/faculty'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (sectionId) loadRoster(); 
  }, [sectionId]);

  const handleGradeSubmit = async (enrollmentId: string) => {
    const grade = grades[enrollmentId];
    if (!grade) return;
    
    setSavingId(enrollmentId);
    try { 
      await api.submitGrade(enrollmentId, grade); 
      await loadRoster(); // ዳታውን እንደገና አምጣ
    } catch (err) { 
      alert('Failed to save grade'); 
    } finally { 
      setSavingId(null); 
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  if (!section) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {section.course.code}: {section.course.title}
        </h1>
        <p className="text-slate-500 mt-1">Section {section.sectionCode} • {section.enrollments.length} students</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-lg">Class Roster & Gradebook</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Student No.</th>
                <th className="px-6 py-4 font-medium">Current Grade</th>
                <th className="px-6 py-4 font-medium text-right">Update Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {section.enrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No students enrolled in this section yet.
                  </td>
                </tr>
              ) : (
                section.enrollments.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {e.student.user.profile?.firstName} {e.student.user.profile?.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {e.student.studentNumber}
                    </td>
                    <td className="px-6 py-4">
                      {e.grade ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{e.grade}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-slate-500">Not Graded</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <select 
                        className="h-9 rounded-md border border-slate-300 px-2 text-sm focus:border-violet-500 focus:outline-none" 
                        value={grades[e.id] || ''} 
                        onChange={(ev) => setGrades({ ...grades, [e.id]: ev.target.value })}
                      >
                        <option value="" disabled>Select Grade</option>
                        {GRADES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <Button 
                        size="sm" 
                        onClick={() => handleGradeSubmit(e.id)} 
                        disabled={savingId === e.id || !grades[e.id] || grades[e.id] === e.grade} 
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {savingId === e.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}