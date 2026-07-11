import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  cookies?: Record<string, string>;
  path: string;
  method: string;
  header(name: string): string | undefined;
}
