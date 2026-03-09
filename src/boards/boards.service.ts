import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto, userId: string) {
    return this.prisma.board.create({
      data: {
        title: createBoardDto.title,
        description: createBoardDto.description,
        members: {
          create: {
            userId: userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.board.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        members: {
          include: { user: true },
        },
        lists: {
          include: {
            tasks: {
              include: {
                assignees: { include: { user: true } },
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true },
        },
        lists: {
          include: {
            tasks: {
              include: {
                assignees: {
                  include: { user: true },
                },
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        },
      },
    });
  }

  async findAllGlobal() {
    return this.prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          include: { user: true },
        },
        lists: {
          include: {
            tasks: true,
          },
        },
      },
    });
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
    });
  }

  remove(id: string) {
    return this.prisma.board.delete({
      where: { id },
    });
  }

  async getAvailableUsers(boardId: string) {
    const existingMembers = await this.prisma.boardMember.findMany({
      where: { boardId },
    });

    const memberIds = existingMembers.map((m) => m.userId);

    return this.prisma.user.findMany({
      where: {
        id: { notIn: memberIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async addMember(boardId: string, userId: string, role: string) {
    const existing = await this.prisma.boardMember.findFirst({
      where: { boardId, userId },
    });

    if (existing) {
      throw new BadRequestException('User is already a member of this board');
    }

    return this.prisma.boardMember.create({
      data: {
        boardId,
        userId,
        role: role.toUpperCase() as Role,
      },
      include: {
        user: true,
      },
    });
  }
}
