import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { CorrelationIdContext } from './correlation-id.context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly context: CorrelationIdContext) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const incoming = request.header('x-correlation-id');
    const correlationId = incoming?.trim() || randomUUID();
    response.setHeader('x-correlation-id', correlationId);
    request.headers['x-correlation-id'] = correlationId;

    this.context.run(correlationId, next);
  }
}
