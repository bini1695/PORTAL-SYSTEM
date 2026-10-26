'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Loader2 } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    creditUnits: 3,
    degreeLevel: 'BACHELOR',
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCourses(search);
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createCourse({
        ...formData,
        code: formData.code.toUpperCase(),
        creditUnits: Number(formData.creditUnits),
      });
      setIsModalOpen(false);
      setFormData({ code: '', title: '', creditUnits: 3, degreeLevel: 'BACHELOR' });
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
          <p className="text-slate-500">Manage all academic courses.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Course
        </Button>
      </div>
      
      <Card className="border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search courses..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Level</th>
                  {/* Program አምድ ተወግዷል */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-medium">{c.code}</td>
                    <td className="px-6 py-4">{c.title}</td>
                    <td className="px-6 py-4">{c.creditUnits}</td>
                    <td className="px-6 py-4">{c.degreeLevel}</td>
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
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Course Code</Label>
                  <Input placeholder="CS101" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Credits</Label>
                  <Input type="number" required value={formData.creditUnits} onChange={(e) => setFormData({ ...formData, creditUnits: Number(e.target.value) })} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              
              <div className="space-y-1.5">
                <Label>Degree Level</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm" value={formData.degreeLevel} onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value })}>
                  <option value="BACHELOR">Bachelor</option>
                  <option value="MASTER">Master</option>
                  <option value="DOCTORATE">Doctorate</option>
                </select>
              </div>

              {/* Program Dropdown ተወግዷል */}

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}