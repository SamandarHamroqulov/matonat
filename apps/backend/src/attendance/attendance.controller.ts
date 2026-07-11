import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @Post()
  mark(@Body() markAttendanceDto: MarkAttendanceDto, @Request() req: { user: AuthenticatedUser }) {
    return this.attendanceService.mark(markAttendanceDto, req.user.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @Get()
  findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @Get('group/:groupId/date/:date')
  getGroupAttendance(
    @Param('groupId') groupId: string,
    @Param('date') date: string,
  ) {
    return this.attendanceService.getGroupAttendance(groupId, date);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
