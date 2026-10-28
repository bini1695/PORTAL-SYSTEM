'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // የፋኩልቲውን ሴክሽኖች ማምጣት
  useEffect(() => {
    api.getFacultySections().then((data: any) => {
      const sectionList = data.sections || data || [];
      setSections(sectionList);
      if (sectionList.length > 0) setSelectedSection(sectionList[0].id);
    }).catch(console.error);
  }, []);

  // የተማሪዎችን መገኘት ማምጣት
  useEffect(() => {
    if (!selectedSection) return;
    setLoading(true);
    // ኤፒአይ ላይ ይህንን መጨመር አለብዎ
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/section/${selectedSection}?date=${date}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('sres_access_token')}` }
    })
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSection, date]);

  const markStatus = async (enrollmentId: string, status: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sres_access_token')}`
        },
        body: JSON.stringify({ enrollmentId, date, status })
      });
      
      // በስክሪኑ ላይ ሁኔታውን ማዘመን
      setStudents(prev => prev.map(s => 
        s.enrollmentId === enrollmentId ? { ...s, status } : s
      ));
    } catch (error) {
      alert('Failed to mark attendance');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500 mt-1">Record daily attendance for your courses.</p>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-300 rounded-md p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border border-slate-300 rounded-md p-2 text-sm min-w-[200px]"
            >
              {sections.map((s: any) => (
                <option key={s.id} value={s.id}>{s.sectionCode} - {s.course?.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No students enrolled in this section.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-medium text-slate-600">Student Number</th>
                  <th className="p-4 text-sm font-medium text-slate-600">Student Name</th>
                  <th className="p-4 text-sm font-medium text-slate-600 text-right">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.enrollmentId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-4 text-sm font-medium text-slate-700">{student.studentNumber}</td>
                    <td className="p-4 text-sm text-slate-900">{student.studentName}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <Button 
                        size="sm"
                        variant={student.status === 'ABSENT' ? 'default' : 'outline'}
                        className={student.status === 'ABSENT' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-600 border-red-200 hover:bg-red-50'}
                        onClick={() => markStatus(student.enrollmentId, 'ABSENT')}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Absent
                      </Button>
                      <Button 
                        size="sm"
                        variant={student.status === 'PRESENT' ? 'default' : 'outline'}
                        className={student.status === 'PRESENT' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}
                        onClick={() => markStatus(student.enrollmentId, 'PRESENT')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Present
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}