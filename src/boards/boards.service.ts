import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: createBoardDto.title,
        description: createBoardDto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.board.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
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
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
        lists: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                assignees: {
                  include: { user: true },
                },
              },
            },
          },
        },
        members: { include: { user: true } },
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
