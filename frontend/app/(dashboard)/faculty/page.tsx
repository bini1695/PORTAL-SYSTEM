'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function GradebookPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]); // 👈 ስሙን ወደ roster ቀይረነዋል
  const [isLoading, setIsLoading] = useState(true);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // 1. ሴክሽኖችን ማምጣት
  useEffect(() => {
    async function loadSections() {
      try {
        const data = await api.getFacultySections();
        // Backend የሚመልሰው ሙሉ object ስለሆነ data.sections ን እንወስዳለን (ካለ)
        const sectionsList = data.sections || data; 
        setSections(sectionsList);
        
        if (sectionsList.length > 0) {
          handleSelectSection(sectionsList[0]); 
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSections();
  }, []);

  // 2. የተማሪዎችን ዝርዝር ማምጣት
  const handleSelectSection = async (section: any) => {
    setSelectedSection(section);
    setIsRosterLoading(true);
    try {
      const data = await api.getSectionRoster(section.id);
      
      // 👇 ከ Backend የመጣውን ዳታ በትክክል መውሰድ (enrollments የሚለው Array ነው)
      if (data && data.enrollments) {
        setRoster(data.enrollments);
      } else if (Array.isArray(data)) {
        setRoster(data);
      } else {
        setRoster([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRosterLoading(false);
    }
  };

  // 3. ነጥብ ማስገባት
  const handleGradeChange = async (enrollmentId: string, newGrade: string) => {
    setSavingId(enrollmentId);
    try {
      await api.submitGrade(enrollmentId, newGrade);
      // የተማሪውን ስቴት በአካባቢው ማዘመን (እንዳይጠብቅ)
      setRoster(prev => prev.map(s => 
        s.id === enrollmentId ? { ...s, grade: newGrade } : s
      ));
    } catch (error: any) {
      alert(error.message || 'Failed to save grade');
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gradebook</h1>
          <p className="text-sm text-slate-500 mt-1">Enter and update student grades.</p>
        </div>
        
        {/* የሴክሽን መምረጫ */}
        {sections.length > 0 && (
          <div className="w-72">
            <label className="block text-xs font-medium text-slate-500 mb-1">Select Class Section</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-violet-500 focus:border-violet-500"
              onChange={(e) => {
                const sec = sections.find(s => s.id === e.target.value);
                if (sec) handleSelectSection(sec);
              }}
              value={selectedSection?.id || ''}
            >
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.course?.code} - Sec {sec.sectionCode} ({sec.term})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          You are not assigned to any sections yet.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800">
              {selectedSection?.course?.code} - {selectedSection?.course?.title}
            </h2>
          </div>
          
          {isRosterLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="p-4 text-sm font-medium text-slate-600">Student Name</th>
                  <th className="p-4 text-sm font-medium text-slate-600">ID Number</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Email</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Current Grade</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-4 text-sm font-medium text-slate-900">
                      {/* 👇 ትክክለኛው የዳታ አወቃቀር እና ጥበቃ (Optional Chaining) */}
                      {e.student?.user?.profile?.firstName || 'N/A'} {e.student?.user?.profile?.lastName || ''}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-600">{e.student?.studentNumber}</td>
                    <td className="p-4 text-sm text-slate-600">{e.student?.user?.email}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        e.grade ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {e.grade || 'Not Graded'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <select 
                          value={e.grade || ''}
                          onChange={(evt) => handleGradeChange(e.id, evt.target.value)}
                          disabled={savingId === e.id}
                          className="border border-slate-300 rounded-md p-1.5 text-sm focus:ring-violet-500 focus:border-violet-500"
                        >
                          <option value="" disabled>Select Grade</option>
                          <option value="A">A</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="B-">B-</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                        {savingId === e.id && (
                          <span className="text-xs text-slate-400">Saving...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No students are currently enrolled in this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}