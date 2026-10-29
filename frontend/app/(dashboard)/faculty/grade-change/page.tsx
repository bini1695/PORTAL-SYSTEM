'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function RequestGradeChangePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [roster, setRoster] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ enrollmentId: '', newGrade: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getFacultySections().then((res: any) => {
      const list = res.sections || res || [];
      setSections(list);
      if (list.length > 0) setSelectedSection(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedSection) {
      setLoading(true);
      api.getSectionRoster(selectedSection).then((data) => {
        setRoster(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [selectedSection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.requestGradeChange(formData);
      alert('Request submitted successfully to Registrar!');
      setFormData({ enrollmentId: '', newGrade: '', reason: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Request Grade Change</h1>
        <p className="text-slate-500 mt-1">Submit a correction request to the Registrar.</p>
      </div>

      <div className="w-64">
        <label className="block text-sm font-medium text-slate-700 mb-1">Select Section</label>
        <select
          className="w-full border border-slate-300 rounded-md p-2 text-sm"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          {sections.map((s: any) => (
            <option key={s.id} value={s.id}>{s.course?.code} - Sec {s.sectionCode}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
      ) : roster && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                <select
                  required
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={formData.enrollmentId}
                  onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
                >
                  <option value="">-- Select a student --</option>
                  {roster.enrollments?.map((en: any) => (
                    <option key={en.id} value={en.id}>
                      {en.student.user.profile?.firstName} {en.student.user.profile?.lastName} (Current: {en.grade || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Grade</label>
                <select
                  required
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={formData.newGrade}
                  onChange={(e) => setFormData({ ...formData, newGrade: e.target.value })}
                >
                  <option value="">-- Select New Grade --</option>
                  {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Change</label>
                <textarea
                  required
                  className="w-full border border-slate-300 rounded-md p-2 text-sm h-24"
                  placeholder="e.g., Scoring error in Final Exam paper..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={submitting} className="bg-violet-600 hover:bg-violet-700">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}