import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Priority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const data: Prisma.TaskCreateInput = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      order: createTaskDto.order,
      priority: (createTaskDto.priority?.toUpperCase() as Priority) || 'LOW',
      list: { connect: { id: createTaskDto.listId } },
    };

    if (createTaskDto.dueDate) {
      data.dueDate = new Date(createTaskDto.dueDate);
    }

    if (createTaskDto.assignees && createTaskDto.assignees.length > 0) {
      data.assignees = {
        create: createTaskDto.assignees.map((userId) => ({
          user: { connect: { id: userId } },
        })),
      };
    }

    return this.prisma.task.create({ data });
  }

  findAll() {
    return this.prisma.task.findMany();
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: true } },
      },
    });
    if (!task) throw new NotFoundException(`Task with id ${id} not found`);
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const validData: Prisma.TaskUpdateInput = {};

    if (updateTaskDto.title !== undefined)
      validData.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      validData.description = updateTaskDto.description;
    if (updateTaskDto.order !== undefined)
      validData.order = updateTaskDto.order;

    if (
      updateTaskDto.priority !== undefined &&
      updateTaskDto.priority !== null
    ) {
      validData.priority = updateTaskDto.priority.toUpperCase() as Priority;
    }

    if (updateTaskDto.dueDate !== undefined) {
      validData.dueDate = updateTaskDto.dueDate
        ? new Date(updateTaskDto.dueDate)
        : null;
    }

    if (updateTaskDto.listId !== undefined) {
      validData.list = { connect: { id: updateTaskDto.listId } };
    }

    if (updateTaskDto.assignees !== undefined) {
      validData.assignees = {
        deleteMany: {},
        create: updateTaskDto.assignees.map((userId) => ({
          user: { connect: { id: userId } },
        })),
      };
    }

    return this.prisma.task.update({
      where: { id },
      data: validData,
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async reorder(tasks: { id: string; listId: string; order: number }[]) {
    const updates = tasks.map((task) =>
      this.prisma.task.update({
        where: { id: task.id },
        data: {
          list: { connect: { id: task.listId } },
          order: task.order,
        },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
