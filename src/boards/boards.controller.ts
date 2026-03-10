import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    sub?: string;
    email: string;
    role: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('admin/all')
  async findAllGlobalBoards(@Req() req: RequestWithUser) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('Invalid token payload');

    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. Only Global Admins can view all system boards.',
      );
    }

    return this.boardsService.findAllGlobal();
  }

  @Delete('admin/:id')
  async deleteGlobalBoard(
    @Req() req: RequestWithUser,
    @Param('id') boardId: string,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('Invalid token payload');

    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. Only Global Admins can delete system boards.',
      );
    }

    return this.boardsService.remove(boardId);
  }

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @Req() req: RequestWithUser) {
    return this.boardsService.create(createBoardDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.boardsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardsService.remove(id);
  }

  @Get(':id/available-users')
  getAvailableUsers(@Param('id') id: string) {
    return this.boardsService.getAvailableUsers(id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role: string },
  ) {
    return this.boardsService.addMember(id, body.userId, body.role);
  }
}
