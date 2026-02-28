import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        listId: createTaskDto.listId,
        order: createTaskDto.order,
        priority: createTaskDto.priority || 'LOW',

        ...(createTaskDto.dueDate && {
          dueDate: new Date(createTaskDto.dueDate),
        }),
      },
    });
  }

  findAll() {
    return this.prisma.task.findMany();
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: string) {
    return `This action removes a #${id} task`;
  }

  async reorder(tasks: { id: string; listId: string; order: number }[]) {
    const updates = tasks.map((task) =>
      this.prisma.task.update({
        where: { id: task.id },
        data: {
          listId: task.listId,
          order: task.order,
        },
      }),
    );

    return this.prisma.$transaction(updates);
  }
}
