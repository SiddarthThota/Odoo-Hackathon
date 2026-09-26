export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface AuthUser {
  sub: string;
  role: UserRole;
  email?: string;
}
