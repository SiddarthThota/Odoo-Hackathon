import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { InventoryClient, InventoryIncrementLine, InventoryMoveLine } from './inventory.types';
import { BadGatewayException, ConflictException } from '@nestjs/common';
import { CorrelationIdContext } from '../common/correlation-id.context';

@Injectable()
export class HttpInventoryClient implements InventoryClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly correlation: CorrelationIdContext,
  ) {
    this.baseUrl = (this.config.get<string>('INVENTORY_SERVICE_URL') ?? '').replace(/\/$/, '');
    this.timeout = Number(this.config.get<string>('INVENTORY_SERVICE_TIMEOUT_MS') ?? '5000');
  }

  async increment(operationId: string, warehouseId: string, lines: InventoryIncrementLine[]): Promise<void> {
    await this.post('/stock/increment', { operationId, warehouseId, lines });
  }

  async decrement(operationId: string, warehouseId: string, lines: InventoryIncrementLine[]): Promise<void> {
    await this.post('/stock/decrement', { operationId, warehouseId, lines });
  }

  async move(
    operationId: string,
    sourceLocationId: string,
    destinationLocationId: string,
    lines: InventoryMoveLine[],
  ): Promise<void> {
    await this.post('/stock/move', {
      operationId,
      sourceLocationId,
      destinationLocationId,
      lines,
    });
  }

  async adjust(operationId: string, productId: string, locationId: string, delta: number): Promise<void> {
    await this.post('/stock/adjust', { operationId, productId, locationId, delta });
  }

  async getQuantity(productId: string, locationId: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ quantity: number }>(`${this.baseUrl}/stock/quantity`, {
          params: { productId, locationId },
          timeout: this.timeout,
        }),
      );
      const quantity = Number(response.data?.quantity);
      if (!Number.isFinite(quantity)) {
        throw new BadGatewayException('Inventory Service returned an invalid quantity');
      }
      return quantity;
    } catch (error) {
      this.rethrowDownstreamError(error, 'read stock quantity');
    }
  }

  private async post(path: string, payload: unknown): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}${path}`, payload, {
          timeout: this.timeout,
          headers: {
            'x-operation-service': 'stocksense-operations',
            'x-idempotency-key': this.extractOperationId(payload),
            ...(this.correlation.get() ? { 'x-correlation-id': this.correlation.get() } : {}),
          },
        }),
      );
    } catch (error) {
      this.rethrowDownstreamError(error, `call Inventory Service ${path}`);
    }
  }

  private extractOperationId(payload: unknown): string {
    if (typeof payload === 'object' && payload !== null && 'operationId' in payload) {
      return String((payload as { operationId: string }).operationId);
    }
    return 'unknown';
  }

  private rethrowDownstreamError(error: unknown, action: string): never {
    const axiosError = error as AxiosError<unknown>;
    if (axiosError.response?.status === 409) {
      throw new ConflictException(`Inventory Service rejected request while attempting to ${action}`);
    }
    throw new BadGatewayException(`Inventory Service unavailable while attempting to ${action}`);
  }
}
