'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, FileText } from 'lucide-react';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', address: '' });

  // 1. የመገለጫ ዳታ ማምጣት
  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getMyProfile();
      setProfile(data);
      setFormData({
        firstName: data.user.profile?.firstName || '',
        lastName: data.user.profile?.lastName || '',
        phone: data.user.profile?.phone || '',
        address: data.user.profile?.address || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 2. መገለጫ ማሻሻል
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateProfile(formData);
      await loadProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. ሰነድ መጫን
  const handleUploadDocument = async (type: string) => {
    const fakeUrl = `https://example.com/docs/${type.toLowerCase()}-${Date.now()}.pdf`;
    try {
      await api.uploadDocument({ type, url: fakeUrl });
      await loadProfile();
    } catch (err) {
      alert('Failed to upload document');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  if (!profile) return <div className="text-center py-20">No profile found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile & Documents</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and upload documents.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input value={profile.studentNumber} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.user.email} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 University Ave" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-violet-600 hover:bg-violet-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">My Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Buttons */}
            <div className="space-y-3">
              <div onClick={() => handleUploadDocument('TRANSCRIPT')} className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Upload Transcript</span>
              </div>
              <div onClick={() => handleUploadDocument('ID_CARD')} className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Upload ID Card</span>
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Uploaded Files</h3>
              {profile.documents.length === 0 ? (
                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md border"><FileText className="h-4 w-4 text-slate-500" /></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.type.replace('_', ' ')}</p>
                          <p className="text-xs text-slate-500">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant={doc.status === 'APPROVED' ? 'success' : doc.status === 'REJECTED' ? 'destructive' : 'warning'}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}