import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // ማሳወቂያ መፍጠር
  async create(userId: string, data: { title: string, message: string, type: string, link?: string }) {
    return this.prisma.notification.create({
      data: { userId, ...data },
    });
  }

  // የተጠቃሚውን ማሳወቂያዎች ማምጣት
  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ማሳወቂያ እንደተነበበ ምልክት ማድረግ
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  // ሁሉንም ማሳወቂያዎች እንደተነበቡ ምልክት ማድረግ
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}