import type { AuthResponse, EnrollmentDTO, InvoiceDTO, SectionDTO } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sres_access_token');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const message = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message ?? `Request failed (${res.status})`;
      throw new ApiError(message, res.status);
    }

    return (await res.json()) as T;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new ApiError('Cannot connect to the server. Please ensure the backend is running.', 503);
    }
    throw error;
  }
}

export const api = {
  // ==========================================
  // Auth
  // ==========================================
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: any) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ==========================================
  // Student
  // ==========================================
  listSections: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<SectionDTO[]>(`/sections${qs ? `?${qs}` : ''}`);
  },
  myEnrollments: () => request<EnrollmentDTO[]>('/enrollments/me'),
  enroll: (sectionId: string) =>
    request<any>('/enrollments', { method: 'POST', body: JSON.stringify({ sectionId }) }),
  drop: (sectionId: string) =>
    request<{ success: boolean }>(`/enrollments/${sectionId}`, { method: 'DELETE' }),
  myInvoices: () => request<InvoiceDTO[]>('/billing/invoices/me'),
  getMyGrades: () => request<any>('/students/me/grades'),

  // ==========================================
  // Admin
  // ==========================================
  getAllStudents: () => request<any[]>('/students'),
  updateStudentStatus: (studentId: string, status: string) =>
    request<{ success: boolean }>(`/students/${studentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getAllCourses: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<any[]>(`/courses${qs}`);
  },
  createCourse: (data: any) =>
    request<any>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  getAllSections: () => request<any[]>('/sections'),
  createSection: (data: any) =>
    request<any>('/sections', { method: 'POST', body: JSON.stringify(data) }),

  // ==========================================
  // User Management (Admin & Super Admin)
  // ==========================================
  getAllUsers: () => request<any[]>('/users'),
  
  createUser: (data: any) => 
    request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    
  resetUserPassword: (id: string, password: string) => 
    request<any>(`/users/${id}/reset-password`, { 
      method: 'PATCH', 
      body: JSON.stringify({ password }) 
    }),
    
  updateUserStatus: (id: string, status: string) => 
    request<any>(`/users/${id}/status`, { 
      method: 'PATCH', 
      body: JSON.stringify({ status }) 
    }),
    
  deleteUser: (id: string) => 
    request<any>(`/users/${id}`, { method: 'DELETE' }),

  // ==========================================
  // Faculty
  // ==========================================
  getFacultyList: () => request<any[]>('/faculty/list'),
  getFacultySections: () => request<any>('/faculty/sections'),
  getSectionRoster: (sectionId: string) => request<any>(`/faculty/sections/${sectionId}/roster`),
  submitGrade: (enrollmentId: string, grade: string) =>
    request<any>('/faculty/grades', {
      method: 'POST',
      body: JSON.stringify({ enrollmentId, grade }),
    }),

  // ==========================================
  // Announcements
  // ==========================================
  getAllAnnouncements: () => request<any[]>('/announcements'),
  createAnnouncement: (data: { title: string; content: string }) =>
    request<any>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) =>
    request<any>(`/announcements/${id}`, { method: 'DELETE' }),

  // ==========================================
  // Profile & Documents
  // ==========================================
  getMyProfile: () => request<any>('/students/me'),
  updateProfile: (data: any) =>
    request<any>('/students/me', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadDocument: (data: { type: string; url: string }) =>
    request<any>('/students/me/documents', { method: 'POST', body: JSON.stringify(data) }),

  // ==========================================
  // Billing & Finance
  // ==========================================
  getBillingStats: () => request<any>('/billing/stats'),
  getBillingInvoices: () => request<any[]>('/billing/invoices'),
  createInvoice: (data: any) =>
    request<any>('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (data: any) =>
    request<any>('/billing/payments', { method: 'POST', body: JSON.stringify(data) }),
  getAllPayments: () => request<any[]>('/billing/payments'),

  // ==========================================
  // Audit
  // ==========================================
  getAuditLogs: () => request<any[]>('/audit'),

  // ==========================================
  // Settings
  // ==========================================
  getSettings: () => request<Record<string, string>>('/settings'),
  updateSettings: (data: Record<string, string>) => 
    request<{ success: boolean }>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};