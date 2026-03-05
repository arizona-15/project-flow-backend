import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BoardsModule } from './boards/boards.module';
import { ListsModule } from './lists/lists.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, BoardsModule, ListsModule, TasksModule, ActivityLogsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
