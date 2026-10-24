export type Role = 'ADMIN' | 'REGISTRAR' | 'FACULTY' | 'BURSAR' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  accountStatus: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ScheduleSlot {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start: string;
  end: string;
}

export interface SectionDTO {
  id: string;
  sectionCode: string;
  term: 'FALL' | 'SPRING' | 'SUMMER' | 'WINTER';
  academicYear: string;
  room: string | null;
  capacity: number;
  enrolledCount: number;
  waitlistCount: number;
  schedule: ScheduleSlot[];
  course: { id: string; code: string; title: string; creditUnits: number; };
  instructorName: string | null;
}

export interface EnrollmentDTO {
  id: string;
  sectionId: string;
  status: 'ENROLLED' | 'WAITLISTED' | 'DROPPED' | 'COMPLETED' | 'FAILED';
  grade: string | null;
  section?: {
    id: string; sectionCode: string; term: string; academicYear: string; room: string | null;
    schedule: ScheduleSlot[];
    course: { id: string; code: string; title: string; creditUnits: number; };
  };
}

export interface InvoiceDTO {
  id: string;
  number: string;
  amountCents: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID';
  dueDate: string;
  description: string | null;
  createdAt: string;
  payments: { id: string; amountCents: number; status: string; paidAt: string | null; }[];
}