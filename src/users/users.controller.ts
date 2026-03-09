import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface JwtUser {
  id?: string;
  sub?: string;
}

interface RequestWithUser extends Request {
  user?: JwtUser;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const currentUser = await this.usersService.findById(String(userId));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. Only Global Admins can view all users.',
      );
    }

    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  async updateRole(
    @Req() req: RequestWithUser,
    @Param('id') targetId: string,
    @Body('role') role: string,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const currentUser = await this.usersService.findById(String(userId));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. Only Global Admins can update roles.',
      );
    }

    return this.usersService.updateRole(targetId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') targetId: string) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const currentUser = await this.usersService.findById(String(userId));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. Only Global Admins can delete users.',
      );
    }

    if (String(userId) === targetId) {
      throw new ForbiddenException('You cannot delete your own admin account.');
    }

    const targetUser = await this.usersService.findById(targetId);
    if (targetUser && targetUser.role === 'ADMIN') {
      throw new ForbiddenException(
        'Cannot delete another Admin. Demote them to Manager/Member first.',
      );
    }

    return this.usersService.remove(targetId);
  }
}
