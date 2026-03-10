import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateRole(targetId: string, role: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: { role: role.toUpperCase() as Role },
      select: { id: true, name: true, role: true, email: true },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_ROLE',
        details: `Changed role of ${updatedUser.name} (${updatedUser.email}) to ${updatedUser.role}`,
      },
    });

    return updatedUser;
  }

  async remove(targetId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new NotFoundException('User not found');

    const deletedUser = await this.prisma.user.delete({
      where: { id: targetId },
      select: { id: true, name: true, email: true },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'DELETE_USER',
        details: `Permanently deleted user: ${deletedUser.name} (${deletedUser.email})`,
      },
    });

    return deletedUser;
  }

  async getSystemLogs() {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true, email: true, role: true } },
        board: { select: { title: true } },
      },
    });
  }
}
