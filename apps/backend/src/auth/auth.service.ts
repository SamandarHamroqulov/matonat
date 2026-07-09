import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is inactive');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
    });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(rawRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }

  async refresh(userId: string, rawRefreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    let foundToken: any = null;
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(rawRefreshToken, token.tokenHash);
      if (isMatch) {
        foundToken = token;
        break;
      }
    }

    if (!foundToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: foundToken.id },
      data: { isRevoked: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is inactive or deleted');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const newAccessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
    });

    const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = await bcrypt.hash(newRawRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      rawRefreshToken: newRawRefreshToken,
    };
  }

  async logout(userId: string, rawRefreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
      },
    });

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(rawRefreshToken, token.tokenHash);
      if (isMatch) {
        await this.prisma.refreshToken.update({
          where: { id: token.id },
          data: { isRevoked: true },
        });
        break;
      }
    }
  }
}
