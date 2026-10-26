import { PrismaClient, Role, AccountStatus, DegreeLevel, Term } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const hash = await bcrypt.hash('Password123', rounds);

  // ---- Admin ----
  await prisma.user.upsert({
    where: { email: 'admin@sres.local' },
    update: {},
    create: {
      email: 'admin@sres.local',
      passwordHash: hash,
      role: Role.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      emailVerified: true,
      profile: { create: { firstName: 'System', lastName: 'Admin' } },
    },
  });

  // ---- Bursar ----
  await prisma.user.upsert({
    where: { email: 'bursar@sres.local' },
    update: {},
    create: {
      email: 'bursar@sres.local',
      passwordHash: hash,
      role: Role.BURSAR,
      accountStatus: AccountStatus.ACTIVE,
      emailVerified: true,
      profile: { create: { firstName: 'Bob', lastName: 'Bursar' } },
    },
  });

  // ---- Faculty ----
  const facultyUser = await prisma.user.upsert({
    where: { email: 'faculty@sres.local' },
    update: {},
    create: {
      email: 'faculty@sres.local',
      passwordHash: hash,
      role: Role.FACULTY,
      accountStatus: AccountStatus.ACTIVE,
      emailVerified: true,
      profile: { create: { firstName: 'Fiona', lastName: 'Faculty' } },
    },
  });
  const faculty = await prisma.faculty.upsert({
    where: { userId: facultyUser.id },
    update: {},
    create: {
      userId: facultyUser.id,
      employeeNo: 'EMP-0001',
      department: 'Computer Science',
    },
  });

  // ---- Student ----
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@sres.local' },
    update: {},
    create: {
      email: 'student@sres.local',
      passwordHash: hash,
      role: Role.STUDENT,
      accountStatus: AccountStatus.ACTIVE,
      emailVerified: true,
      profile: { create: { firstName: 'Sam', lastName: 'Student' } },
    },
  });
  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      studentNumber: 'STU-00001',
      status: AccountStatus.ACTIVE,
      program: 'BSc Computer Science',
      degreeLevel: DegreeLevel.BACHELOR,
      admittedAt: new Date(),
    },
  });

  // ---- Courses ----
  const cs101 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      code: 'CS101',
      title: 'Intro to Programming',
      description: 'Fundamentals of programming.',
      creditUnits: 3,
      degreeLevel: DegreeLevel.BACHELOR,
    },
  });

  const cs102 = await prisma.course.upsert({
    where: { code: 'CS102' },
    update: {},
    create: {
      code: 'CS102',
      title: 'Data Structures',
      description: 'Arrays, lists, trees, graphs.',
      creditUnits: 4,
      degreeLevel: DegreeLevel.BACHELOR,
    },
  });

  await prisma.prerequisite.upsert({
    where: {
      courseId_prerequisiteId: {
        courseId: cs102.id,
        prerequisiteId: cs101.id,
      },
    },
    update: {},
    create: {
      courseId: cs102.id,
      prerequisiteId: cs101.id,
      minimumGrade: 'C',
    },
  });

  // ---- Sections ----
  await prisma.section.upsert({
    where: {
      courseId_term_academicYear_sectionCode: {
        courseId: cs101.id,
        term: Term.FALL,
        academicYear: '2026-2027',
        sectionCode: 'A',
      },
    },
    update: {},
    create: {
      courseId: cs101.id,
      instructorId: faculty.id,
      term: Term.FALL,
      academicYear: '2026-2027',
      sectionCode: 'A',
      room: 'B-101',
      capacity: 30,
      schedule: [
        { day: 'MON', start: '09:00', end: '10:30' },
        { day: 'WED', start: '09:00', end: '10:30' },
      ],
    },
  });

  await prisma.section.upsert({
    where: {
      courseId_term_academicYear_sectionCode: {
        courseId: cs102.id,
        term: Term.FALL,
        academicYear: '2026-2027',
        sectionCode: 'A',
      },
    },
    update: {},
    create: {
      courseId: cs102.id,
      instructorId: faculty.id,
      term: Term.FALL,
      academicYear: '2026-2027',
      sectionCode: 'A',
      room: 'B-102',
      capacity: 25,
      schedule: [
        { day: 'TUE', start: '11:00', end: '12:30' },
        { day: 'THU', start: '11:00', end: '12:30' },
      ],
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());