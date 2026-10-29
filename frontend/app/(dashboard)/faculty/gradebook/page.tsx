'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Plus } from 'lucide-react';

export default function GradebookMainPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [gradebook, setGradebook] = useState<any>(null);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingGradebook, setLoadingGradebook] = useState(false);
  const [marksState, setMarksState] = useState<Record<string, Record<string, string>>>({});
  const [isLocked, setIsLocked] = useState(false);

  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ name: '', type: 'QUIZ', weight: 10, totalMarks: 20 });

  useEffect(() => {
    api.getFacultySections()
      .then((res: any) => {
        const list = res.sections || res || [];
        setSections(list);
        if (list.length > 0) setSelectedSectionId(list[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingSections(false));
  }, []);

  const loadGradebook = async (sectionId: string) => {
    setLoadingGradebook(true);
    try {
      const res = await api.getSectionGradebook(sectionId);
      setGradebook(res);
      const allSubmitted = res.students.length > 0 && res.students.every((s: any) => s.gradeSubmitted);
      setIsLocked(allSubmitted);
      
      const initialMarks: any = {};
      res.students.forEach((s: any) => {
        initialMarks[s.enrollmentId] = {};
        Object.keys(s.marks).forEach((aId) => {
          initialMarks[s.enrollmentId][aId] = s.marks[aId] !== null ? String(s.marks[aId]) : '';
        });
      });
      setMarksState(initialMarks);
    } catch (err) {
      console.error(err);
      setGradebook(null);
    } finally {
      setLoadingGradebook(false);
    }
  };

  useEffect(() => {
    if (selectedSectionId) {
      loadGradebook(selectedSectionId);
    }
  }, [selectedSectionId]);

  const handleMarkChange = (enrollmentId: string, assessmentId: string, value: string) => {
    setMarksState(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [assessmentId]: value,
      }
    }));
  };

  const saveMarks = async (assessmentId: string) => {
    if (!gradebook) return;
    try {
      const marksToSend = Object.keys(marksState).map(enrollmentId => ({
        enrollmentId,
        score: Number(marksState[enrollmentId][assessmentId]) || 0,
      }));
      await api.saveMarks(selectedSectionId, assessmentId, marksToSend);
      await loadGradebook(selectedSectionId);
    } catch (err) {
      alert('Failed to save marks');
    }
  };

  const submitGrades = async () => {
    if (!confirm('Are you sure you want to submit and lock all grades for this section?')) return;
    try {
      await api.submitFinalGrades(selectedSectionId);
      await loadGradebook(selectedSectionId);
      alert('Grades submitted and locked successfully!');
    } catch (err) {
      alert('Failed to submit grades');
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAssessment(selectedSectionId, newAssessment);
      setShowAssessmentForm(false);
      setNewAssessment({ name: '', type: 'QUIZ', weight: 10, totalMarks: 20 });
      await loadGradebook(selectedSectionId);
    } catch (err: any) {
      alert(err.message || 'Failed to create assessment');
    }
  };

  if (loadingSections) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gradebook</h1>
          <p className="text-slate-500 mt-1">Enter and update student grades.</p>
        </div>
        <div className="flex items-end gap-4">
          {gradebook && (
            <Button onClick={() => setShowAssessmentForm(!showAssessmentForm)} variant="outline" className="text-violet-700 border-violet-200 hover:bg-violet-50">
              <Plus className="h-4 w-4 mr-2" /> Add Assessment
            </Button>
          )}
          <div className="w-64">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Class Section</label>
            <select
              className="w-full border border-slate-300 rounded-md p-2 text-sm"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
            >
              {sections.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.course?.code} - Sec {s.sectionCode} ({s.term})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showAssessmentForm && (
        <Card className="border-violet-200 bg-violet-50/30">
          <CardContent className="p-4">
            <form onSubmit={handleCreateAssessment} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Name (e.g. Quiz 1)</label>
                <Input required value={newAssessment.name} onChange={(e) => setNewAssessment({...newAssessment, name: e.target.value})} />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select className="w-full border rounded-md p-2 text-sm" value={newAssessment.type} onChange={(e) => setNewAssessment({...newAssessment, type: e.target.value})}>
                  <option value="QUIZ">QUIZ</option>
                  <option value="ASSIGNMENT">ASSIGNMENT</option>
                  <option value="MID_EXAM">MID_EXAM</option>
                  <option value="FINAL_EXAM">FINAL_EXAM</option>
                  <option value="PROJECT">PROJECT</option>
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-slate-700 mb-1">Weight (%)</label>
                <Input type="number" required value={newAssessment.weight} onChange={(e) => setNewAssessment({...newAssessment, weight: Number(e.target.value)})} />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Marks</label>
                <Input type="number" required value={newAssessment.totalMarks} onChange={(e) => setNewAssessment({...newAssessment, totalMarks: Number(e.target.value)})} />
              </div>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loadingGradebook ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
      ) : !gradebook || gradebook.students.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center text-slate-500">
            No students are currently enrolled in this section.
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm overflow-x-auto">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">
              {gradebook.course?.code} - {gradebook.course?.title}
            </h2>
            {isLocked ? (
              <Button disabled variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <Lock className="h-4 w-4 mr-2" /> Grades Locked
              </Button>
            ) : (
              <Button onClick={submitGrades} className="bg-emerald-600 hover:bg-emerald-700">
                Submit & Lock Grades
              </Button>
            )}
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Student Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">ID Number</th>
                <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                {gradebook.assessments.map((a: any) => (
                  <th key={a.id} className="px-4 py-3 font-medium text-slate-600 min-w-[120px]">
                    <div className="flex flex-col">
                      <span>{a.name}</span>
                      <span className="text-xs text-slate-400">{a.weight}% (of {a.totalMarks})</span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium text-slate-600">Total %</th>
                <th className="px-4 py-3 font-medium text-slate-600">Current Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradebook.students.map((student: any) => (
                <tr key={student.enrollmentId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{student.studentName}</td>
                  <td className="px-4 py-3 text-slate-600">{student.studentNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{student.email}</td>
                  {gradebook.assessments.map((a: any) => (
                    <td key={a.id} className="px-4 py-3">
                      <Input
                        type="number"
                        className="w-20 h-8"
                        value={marksState[student.enrollmentId]?.[a.id] || ''}
                        onChange={(e) => handleMarkChange(student.enrollmentId, a.id, e.target.value)}
                        onBlur={() => saveMarks(a.id)}
                        disabled={isLocked}
                        min={0}
                        max={a.totalMarks}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {student.totalPercentage > 0 ? `${student.totalPercentage}%` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {student.grade ? (
                      <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-bold">
                        {student.grade}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}