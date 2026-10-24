'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, Download, BookOpen, Layers } from 'lucide-react';

export default function AdminReportsPage() {
  const [stats, setStats] = useState({ students: 0, courses: 0, sections: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getAllStudents(), api.getAllCourses(), api.getAllSections()])
      .then(([students, courses, sections]) => {
        setStats({
          students: students.length,
          courses: courses.length,
          sections: sections.length,
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load data');
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ የ Export Data ተግባር (CSV ፋይል ማውረድ)
  const handleExportData = () => {
    // የ CSV ፋይል ይዘት ማዘጋጀት
    const csvContent = [
      ['Metric', 'Value'], // Header
      ['Total Enrollments', stats.students.toString()],
      ['Active Students', stats.students.toString()],
      ['Total Courses', stats.courses.toString()],
      ['Active Sections', stats.sections.toString()],
    ]
      .map((row) => row.join(','))
      .join('\n');

    // ፋይሉን ማውረድ
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sres_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500"><p>Error: {error}</p></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500">View institutional data and performance metrics.</p>
        </div>
        {/* ✅ የ Export Data ቁልፍ */}
        <Button variant="outline" className="bg-white" onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" /> Export Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Total Enrollments</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.students}</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> Active students
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Active Students</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.students}</p>
            <p className="text-xs text-slate-500 mt-1">Across all programs</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Total Courses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.courses}</p>
            <p className="text-xs text-slate-500 mt-1">Undergraduate & Graduate</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Active Sections</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.sections}</p>
            <p className="text-xs text-slate-500 mt-1">Currently running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Enrollment by Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Computer Science', count: 450, percentage: 80 },
              { name: 'Business Administration', count: 320, percentage: 60 },
              { name: 'Engineering', count: 280, percentage: 50 },
              { name: 'Arts & Humanities', count: 198, percentage: 35 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.count} Students</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm flex flex-col justify-center items-center p-8 bg-slate-50">
          <Users className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Detailed Reports</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm mt-2 mb-6">
            Download full spreadsheet reports of student grades, attendance, and financial data.
          </p>
          <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleExportData}>
            Generate Master Report
          </Button>
        </Card>
      </div>
    </div>
  );
}