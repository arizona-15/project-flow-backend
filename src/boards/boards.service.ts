import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from '../prisma/prisma.service';

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
}
