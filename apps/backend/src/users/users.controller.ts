import { Body, Controller, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Request() req: { user: AuthenticatedUser }) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  updateMe(@Request() req: { user: AuthenticatedUser }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  @Patch('me/password')
  changePassword(
    @Request() req: { user: AuthenticatedUser },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.id, dto);
  }
}
