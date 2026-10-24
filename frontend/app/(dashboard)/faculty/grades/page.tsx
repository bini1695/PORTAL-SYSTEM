'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, ChevronRight } from 'lucide-react';

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];

export default function FacultyGradebookPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, string>>({});

  // 1. የመምህሩን ኮርሶች ከዳታቤዝ ማምጣት
  useEffect(() => {
    api.getFacultySections()
      .then(data => {
        setSections(data.sections || []);
        if (data.sections && data.sections.length > 0) {
          setSelectedSection(data.sections[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. የተመረጠውን ክፍል ተማሪዎች ማምጣት
  useEffect(() => {
    if (selectedSection) {
      api.getSectionRoster(selectedSection.id)
        .then(data => {
          setSelectedSection(data);
          const initialGrades: Record<string, string> = {};
          data.enrollments.forEach((e: any) => {
            if (e.grade) initialGrades[e.id] = e.grade;
          });
          setGrades(initialGrades);
        })
        .catch(console.error);
    }
  }, [selectedSection?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. ውጤት ማስቀመጥ
  const handleGradeSubmit = async (enrollmentId: string) => {
    const grade = grades[enrollmentId];
    if (!grade) return;
    setSavingId(enrollmentId);
    try {
      await api.submitGrade(enrollmentId, grade);
      // ዳታውን በአዲስ ማምጣት
      const data = await api.getSectionRoster(selectedSection.id);
      setSelectedSection(data);
    } catch (err) {
      alert('Failed to save grade');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gradebook</h1>
        <p className="text-slate-500 mt-1">Manage student grades for your assigned courses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* የኮርሶች ዝርዝር (Sidebar) */}
        <Card className="border-slate-200 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base">My Courses</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors flex items-center justify-between ${
                  selectedSection?.id === sec.id
                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p className="font-bold text-sm">{sec.course.code}</p>
                  <p className="text-xs opacity-80">{sec.course.title}</p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
            {sections.length === 0 && <p className="p-3 text-sm text-slate-500">No courses assigned.</p>}
          </CardContent>
        </Card>

        {/* የተማሪዎች ውጤት ሰንጠረዥ */}
        <Card className="border-slate-200 shadow-sm">
          {selectedSection ? (
            <>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">{selectedSection.course.code}: {selectedSection.course.title}</CardTitle>
                <p className="text-sm text-slate-500">Section {selectedSection.sectionCode} · {selectedSection.enrollments?.length || 0} Students</p>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">Student</th>
                      <th className="px-6 py-3 font-medium">Student ID</th>
                      <th className="px-6 py-3 font-medium">Current Grade</th>
                      <th className="px-6 py-3 font-medium text-right">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSection.enrollments?.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {e.student.user.profile?.firstName} {e.student.user.profile?.lastName}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">{e.student.studentNumber}</td>
                        <td className="px-6 py-4">
                          {e.grade ? (
                            <Badge variant={e.grade === 'F' ? 'destructive' : 'success'}>{e.grade}</Badge>
                          ) : (
                            <Badge variant="secondary">Not Graded</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 flex justify-end gap-2">
                          <select
                            className="h-9 w-24 rounded-md border border-input bg-white px-2 text-sm focus:ring-2 focus:ring-violet-500"
                            value={grades[e.id] || ''}
                            onChange={(ev) => setGrades({ ...grades, [e.id]: ev.target.value })}
                          >
                            <option value="" disabled>Select</option>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleGradeSubmit(e.id)}
                            disabled={savingId === e.id || !grades[e.id] || grades[e.id] === e.grade}
                            className="bg-violet-600 hover:bg-violet-700 text-white w-10 p-0"
                          >
                            {savingId === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!selectedSection.enrollments || selectedSection.enrollments.length === 0) && (
                      <tr><td colSpan={4} className="text-center py-8 text-slate-500">No students enrolled in this section.</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-12 text-slate-500">
              <p>Select a course from the left to view the gradebook.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}