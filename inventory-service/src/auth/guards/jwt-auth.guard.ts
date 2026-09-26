import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('JwtAuthGuard failed:', { err, info: info?.message || info });
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
