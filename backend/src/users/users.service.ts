import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
        emailVerified: true,
        createdAt: true,
        profile: true,
        student: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 👇 አዲስ ተጠቃሚ መፍጠር
  async createUser(actorId: string, data: any) {
    const existing = await this.prisma.user.findUnique({ 
      where: { email: data.email } 
    });
    if (existing) throw new BadRequestException('Email already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role || 'STUDENT',
        accountStatus: 'ACTIVE',
        profile: {
          create: {
            firstName: data.firstName || 'New',
            lastName: data.lastName || 'User',
          }
        }
      },
      include: { profile: true }
    });

    // የተማሪ ከሆነ የተማሪ መለያም መፍጠር
    if (user.role === 'STUDENT') {
      await this.prisma.student.create({
        data: {
          userId: user.id,
          studentNumber: `STU-${Date.now()}`,
          program: 'Undeclared',
          degreeLevel: 'BACHELOR',
          status: 'ACTIVE',
        },
      });
    }

    // የፋኩልቲ ከሆነ የፋኩልቲ መለያም መፍጠር
    if (user.role === 'FACULTY') {
      await this.prisma.faculty.create({
        data: {
          userId: user.id,
          employeeNo: `EMP-${Date.now()}`,
          department: 'General',
        },
      });
    }

    await this.audit.log(actorId, 'CREATE_USER', 'User', user.id, { role: user.role });
    return user;
  }

  // 👇 ፓስወርድ መቀየር
  async resetPassword(actorId: string, id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    
    await this.audit.log(actorId, 'RESET_PASSWORD', 'User', id);
    return { success: true };
  }

  // 👇 ስታተስ መቀየር
  async updateStatus(actorId: string, id: string, status: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { accountStatus: status },
    });

    // የተማሪ ስታተስም አብሮ እንዲቀየር
    const student = await this.prisma.student.findUnique({ where: { userId: id } });
    if (student) {
      await this.prisma.student.update({
        where: { id: student.id },
        data: { status: status },
      });
    }

    await this.audit.log(actorId, 'UPDATE_STATUS', 'User', id, { status });
    return user;
  }

  // 👇 ተጠቃሚ ማጥፋት
  async deleteUser(actorId: string, id: string) {
    await this.prisma.user.delete({ where: { id } });
    await this.audit.log(actorId, 'DELETE_USER', 'User', id);
    return { success: true };
  }
}