import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from '../audit/audit.service';

@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService
  ) {}

  @Get()
  async getSettings() {
    const settings = await this.prisma.setting.findMany();
    
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      systemName: result.systemName || 'SRES — Student Registration System',
      supportEmail: result.supportEmail || 'support@sres.edu',
      require2FA: result.require2FA || 'false',
      sessionTimeout: result.sessionTimeout || '30',
    };
  }

  @Put()
  async updateSettings(@Req() req: any, @Body() body: Record<string, string>) {
    const actorId = req.user?.id || req.user?.userId;
    
    const updates = Object.entries(body).map(([key, value]) => {
      return this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await Promise.all(updates);
    
    if (actorId) {
      await this.audit.log(actorId, 'UPDATE_SETTINGS', 'System', 'settings', body);
    }

    return { success: true, message: 'Settings updated successfully' };
  }
}