import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser, UserRole } from '../types/auth-user';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    const devBypass = this.configService.get<string>('AUTH_DEV_BYPASS') === 'true';
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';

    if (devBypass && nodeEnv !== 'production') {
      const role = request.headers['x-dev-user-role'] as UserRole | undefined;
      request.user = {
        sub: (request.headers['x-dev-user-id'] as string | undefined) ?? 'dev-user',
        role: role && ['InventoryManager', 'WarehouseStaff'].includes(role)
          ? role
          : 'InventoryManager',
      } satisfies AuthUser;
      return true;
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const token = authHeader.slice('Bearer '.length).trim();

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token);

      if (!payload.sub || !payload.role) {
        throw new UnauthorizedException('JWT must contain sub and role');
      }

      if (!['InventoryManager', 'WarehouseStaff'].includes(payload.role)) {
        throw new UnauthorizedException('Unsupported user role');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired JWT');
    }
  }
}
