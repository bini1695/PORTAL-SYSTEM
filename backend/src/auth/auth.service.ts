import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Email already registered');

    const rounds = Number(this.config.get<string>('BCRYPT_ROUNDS') ?? 12);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    // ✅ አንድ ጊዜ ብቻ የሚፈጠር (ከዚህ በፊት ተደግሞ ነበር)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role ?? Role.STUDENT,
        // ✅ በ Admin የተፈጠረ ስለሆነ በቀጥታ ACTIVE ይሁን
        accountStatus: dto.role === Role.ADMIN || dto.role === Role.REGISTRAR 
          ? AccountStatus.ACTIVE 
          : AccountStatus.PENDING,
        profile: {
          create: { firstName: dto.firstName, lastName: dto.lastName },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
      },
    });

    // ✅ ሮሉ FACULTY ከሆነ በራስ-ሰር የ Faculty መለያ ፍጠር
    if (user.role === Role.FACULTY) {
      await this.prisma.faculty.create({
        data: {
          userId: user.id,
          employeeNo: `EMP-${Date.now()}`,
          department: 'General',
        },
      });
    }

    // ✅ ሮሉ STUDENT ከሆነ በራስ-ሰር የ Student መለያ ፍጠር
    if (user.role === Role.STUDENT) {
      await this.prisma.student.create({
        data: {
          userId: user.id,
          studentNumber: `STU-${Date.now()}`,
          program: 'Undeclared',
          degreeLevel: 'BACHELOR',
          status: AccountStatus.PENDING,
        },
      });
    }

    await this.audit.record({
      userId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
        passwordHash: true,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new ForbiddenException('Account is suspended');
    }

    await this.audit.record({
      userId: user.id,
      action: 'USER_LOGGED_IN',
      entity: 'User',
      entityId: user.id,
    });

    return this.issueTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
    });
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, accountStatus: true },
    });
    if (!user || user.accountStatus === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException('User no longer valid');
    }
    return this.issueTokens(user);
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    role: Role;
    accountStatus: string;
  }): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    };
  }
}