import type { Role } from '@prisma/client';

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: Role;
    accountStatus: string;
  };
}