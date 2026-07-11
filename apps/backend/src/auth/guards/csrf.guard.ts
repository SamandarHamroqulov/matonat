import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set(['/auth/login']);

const toTokenBuffer = (value: string) =>
  createHash('sha256').update(value).digest();

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (SAFE_METHODS.has(method) || EXEMPT_PATHS.has(request.path)) {
      return true;
    }

    const cookieToken = request.cookies?.csrf_token;
    const headerToken = request.header('x-csrf-token');

    if (!cookieToken || !headerToken) {
      throw new UnauthorizedException('CSRF token missing');
    }

    const left = toTokenBuffer(cookieToken);
    const right = toTokenBuffer(headerToken);

    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    return true;
  }
}
