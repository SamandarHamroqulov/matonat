import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string; role: string }) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        expiresAt: { gt: new Date() },
      },
    });

    let foundToken: { id: string; isRevoked: boolean } | null = null;
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) {
        foundToken = { id: token.id, isRevoked: token.isRevoked };
        break;
      }
    }

    if (!foundToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (foundToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId: payload.sub,
        },
        data: {
          isRevoked: true,
        },
      });
      throw new UnauthorizedException('Refresh token reused');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or inactive user');
    }

    return { user, rawRefreshToken: refreshToken, tokenId: foundToken.id };
  }
}
