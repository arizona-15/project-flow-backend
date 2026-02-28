import { Injectable } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createListDto: CreateListDto) {
    return this.prisma.list.create({
      data: {
        title: createListDto.title,
        boardId: createListDto.boardId,
        order: createListDto.order,
      },
    });
  }

  findAll() {
    return this.prisma.list.findMany();
  }

  findOne(id: string) {
    return this.prisma.list.findUnique({ where: { id } });
  }

  update(id: string, updateListDto: UpdateListDto) {
    return this.prisma.list.update({
      where: { id },
      data: updateListDto,
    });
  }

  remove(id: string) {
    return this.prisma.list.delete({ where: { id } });
  }
}
