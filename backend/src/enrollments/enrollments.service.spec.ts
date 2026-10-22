import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentService } from './enrollments.service';
import { AuditService } from '../audit/audit.service';
import { ConflictException, ForbiddenException } from '@nestjs/common';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let txMock: any;

  const prismaMock = {
    // FIX: Look up txMock dynamically at the time the transaction runs
    $transaction: jest.fn((callback) => callback(txMock)),
  };

  const auditMock = {
    record: jest.fn(),
    recordInTx: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create a fresh mock for every test
    txMock = {
      student: { findUnique: jest.fn() },
      section: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      hold: { findFirst: jest.fn() },
      enrollment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      auditLog: { create: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();

    service = moduleRef.get<EnrollmentService>(EnrollmentService);
  });

  it('rejects when student has an active hold', async () => {
    txMock.student.findUnique.mockResolvedValue({
      id: 'stu1',
      status: 'ACTIVE',
      degreeLevel: 'BACHELOR',
    });
    txMock.section.findUnique.mockResolvedValue({
      id: 'sec1',
      term: 'FALL',
      academicYear: '2026-2027',
      capacity: 10,
      enrolledCount: 0,
      waitlistCount: 0,
      schedule: [],
      course: {
        degreeLevel: 'BACHELOR',
        prerequisites: [],
      },
    });
    txMock.hold.findFirst.mockResolvedValue({
      id: 'h1',
      type: 'FINANCIAL',
      reason: 'Outstanding balance',
    });

    await expect(service.enrollStudentInSection('u1', 'sec1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects on schedule conflict', async () => {
    txMock.student.findUnique.mockResolvedValue({
      id: 'stu1',
      status: 'ACTIVE',
      degreeLevel: 'BACHELOR',
    });
    txMock.section.findUnique.mockResolvedValue({
      id: 'sec1',
      term: 'FALL',
      academicYear: '2026-2027',
      capacity: 10,
      enrolledCount: 0,
      waitlistCount: 0,
      schedule: [{ day: 'MON', start: '09:00', end: '10:30' }],
      course: { degreeLevel: 'BACHELOR', prerequisites: [] },
    });
    txMock.hold.findFirst.mockResolvedValue(null);
    txMock.enrollment.findMany.mockResolvedValue([
      {
        section: {
          id: 'secX',
          schedule: [{ day: 'MON', start: '10:00', end: '11:00' }],
        },
      },
    ]);

    await expect(service.enrollStudentInSection('u1', 'sec1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});