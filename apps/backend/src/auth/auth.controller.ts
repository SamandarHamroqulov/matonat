import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import * as crypto from 'crypto';
import type { AuthenticatedRequest, AuthenticatedUser } from './authenticated-user.interface';

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const issueCsrfToken = () => crypto.randomBytes(32).toString('hex');

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, rawRefreshToken, user } = await this.authService.login(loginDto);
    const csrfToken = issueCsrfToken();
    
    res.cookie('refresh_token', rawRefreshToken, refreshCookieOptions);
    res.cookie('csrf_token', csrfToken, csrfCookieOptions);

    return { accessToken, user };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() current: { user: AuthenticatedUser; rawRefreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = current.user.id;
    const rawRefreshToken = current.rawRefreshToken;
    const csrfToken = issueCsrfToken();

    const { accessToken, rawRefreshToken: newRefreshToken } = await this.authService.refresh(
      userId,
      rawRefreshToken,
    );

    res.cookie('refresh_token', newRefreshToken, refreshCookieOptions);
    res.cookie('csrf_token', csrfToken, csrfCookieOptions);

    return { accessToken };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request & Pick<AuthenticatedRequest, 'cookies'>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.refresh_token;
    if (rawRefreshToken) {
      await this.authService.logout(user.id, rawRefreshToken);
    }
    
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.clearCookie('csrf_token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
