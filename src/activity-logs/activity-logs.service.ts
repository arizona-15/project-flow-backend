import { Injectable } from '@nestjs/common';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createActivityLogDto: CreateActivityLogDto) {
    return this.prisma.activityLog.create({
      data: {
        boardId: createActivityLogDto.boardId,
        userId: createActivityLogDto.userId,
        action: createActivityLogDto.action,
      },
      include: {
        user: true,
      },
    });
  }

  findAll() {
    return `This action returns all activityLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityLog`;
  }

  update(id: number, updateActivityLogDto: UpdateActivityLogDto) {
    return `This action updates a #${id} activityLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityLog`;
  }
}
