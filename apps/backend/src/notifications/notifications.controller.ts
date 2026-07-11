import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: { user: AuthenticatedUser }) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: { user: AuthenticatedUser }) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req: { user: AuthenticatedUser }) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: { user: AuthenticatedUser }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
