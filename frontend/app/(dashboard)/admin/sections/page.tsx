'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    courseId: '', 
    instructorId: '', 
    term: 'FALL', 
    academicYear: '2026-2027', 
    sectionCode: 'A', 
    room: '', 
    capacity: 30,
    scheduleDay: 'MON', 
    scheduleStart: '09:00', 
    scheduleEnd: '10:30',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [secData, courseData, facultyData] = await Promise.all([
        api.getAllSections(), 
        api.getAllCourses(),
        api.getFacultyList()
      ]);
      setSections(secData); 
      setCourses(courseData);
      setFacultyList(facultyData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) return alert("Please select a course.");
    setIsSubmitting(true);
    try {
      await api.createSection({
        courseId: formData.courseId, 
        instructorId: formData.instructorId || undefined,
        term: formData.term, 
        academicYear: formData.academicYear,
        sectionCode: formData.sectionCode, 
        room: formData.room, 
        capacity: Number(formData.capacity),
        schedule: [{ day: formData.scheduleDay, start: formData.scheduleStart, end: formData.scheduleEnd }]
      });
      setIsModalOpen(false); 
      loadData();
    } catch (err: any) { alert(err.message || 'Failed to create section'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Sections</h1>
          <p className="text-slate-500">Manage sections, assign instructors, and schedules.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Section
        </Button>
      </div>
      
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Instructor</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Term</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sections.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{s.course?.code}</p>
                      <p className="text-xs text-slate-500">{s.course?.title}</p>
                    </td>
                    {/* 👇 ከ Backend የመጣውን instructorName ተጠቅመናል */}
                    <td className="px-6 py-4 text-slate-700">
                      {s.instructorName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 font-medium">{s.sectionCode}</td>
                    <td className="px-6 py-4">{s.term} {s.academicYear}</td>
                    <td className="px-6 py-4">{s.room || 'TBA'}</td>
                    <td className="px-6 py-4">{s.enrolledCount} / {s.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Section</h2>
            <form onSubmit={handleCreateSection} className="space-y-4">
              
              <div className="space-y-1.5">
                <Label>Select Course</Label>
                <select required className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm" value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                  <option value="">-- Choose --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Assign Instructor</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm" value={formData.instructorId} onChange={e => setFormData({...formData, instructorId: e.target.value})}>
                  <option value="">-- Unassigned --</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.user?.profile?.firstName} {f.user?.profile?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Section</Label>
                  <Input required value={formData.sectionCode} onChange={e => setFormData({...formData, sectionCode: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label>Room</Label>
                  <Input value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Term</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm" value={formData.term} onChange={e => setFormData({...formData, term: e.target.value})}>
                    <option value="FALL">Fall</option>
                    <option value="SPRING">Spring</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Capacity</Label>
                  <Input type="number" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Schedule</Label>
                <div className="grid grid-cols-3 gap-2">
                  <select className="flex h-9 w-full rounded-md border border-input bg-white px-2 text-sm" value={formData.scheduleDay} onChange={e => setFormData({...formData, scheduleDay: e.target.value})}>
                    <option value="MON">Mon</option>
                    <option value="TUE">Tue</option>
                    <option value="WED">Wed</option>
                    <option value="THU">Thu</option>
                    <option value="FRI">Fri</option>
                  </select>
                  <Input type="time" value={formData.scheduleStart} onChange={e => setFormData({...formData, scheduleStart: e.target.value})} />
                  <Input type="time" value={formData.scheduleEnd} onChange={e => setFormData({...formData, scheduleEnd: e.target.value})} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-violet-600 text-white hover:bg-violet-700">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}