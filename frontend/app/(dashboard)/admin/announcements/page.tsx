'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Megaphone, Loader2, Trash2 } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await api.getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setIsSubmitting(true);
    try {
      await api.createAnnouncement(formData);
      setFormData({ title: '', content: '' });
      await fetchAnnouncements(); // ዝርዝሩን አድስ
    } catch (err) {
      alert('Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="text-slate-500">Post updates for students and faculty.</p>
      </div>

      {/* የማስታወቂያ መለጠፊያ ፎርም */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="p-3 bg-violet-100 text-violet-600 rounded-lg h-fit">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-4">
              <Input
                placeholder="Title of the announcement"
                className="font-medium"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                className="w-full h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Write your message here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              ></textarea>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Announcement'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* የቀድሞ ማስታወቂያዎች ዝርዝር */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Previous Announcements</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
        ) : announcements.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No announcements yet.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card key={a.id} className="border-slate-200 shadow-sm">
                <CardContent className="p-5 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{a.title}</p>
                    <p className="text-sm text-slate-600 mt-2">{a.content}</p>
                    <p className="text-xs text-slate-400 mt-3">
                      Posted by {a.author?.profile?.firstName || 'Admin'} on {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}