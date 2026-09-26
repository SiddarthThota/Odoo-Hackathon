import { ConflictException, Injectable } from '@nestjs/common';
import { InventoryClient, InventoryIncrementLine, InventoryMoveLine } from './inventory.types';

@Injectable()
export class MockInventoryClient implements InventoryClient {
  private readonly quantities = new Map<string, number>();
  private readonly appliedOperations = new Set<string>();

  constructor() {
    this.seed('PROD-001', 'WH-001', 1000);
    this.seed('PROD-002', 'WH-001', 500);
    this.seed('PROD-001', 'LOC-A', 100);
    this.seed('PROD-001', 'LOC-B', 20);
  }

  seed(productId: string, locationId: string, quantity: number): void {
    this.quantities.set(this.key(productId, locationId), quantity);
  }

  async increment(operationId: string, warehouseId: string, lines: InventoryIncrementLine[]): Promise<void> {
    if (this.appliedOperations.has(operationId)) return;
    for (const line of lines) {
      this.change(line.productId, warehouseId, line.quantity);
    }
    this.appliedOperations.add(operationId);
  }

  async decrement(operationId: string, warehouseId: string, lines: InventoryIncrementLine[]): Promise<void> {
    if (this.appliedOperations.has(operationId)) return;
    for (const line of lines) {
      this.change(line.productId, warehouseId, -line.quantity);
    }
    this.appliedOperations.add(operationId);
  }

  async move(
    operationId: string,
    sourceLocationId: string,
    destinationLocationId: string,
    lines: InventoryMoveLine[],
  ): Promise<void> {
    if (this.appliedOperations.has(operationId)) return;
    for (const line of lines) {
      const current = this.get(line.productId, sourceLocationId);
      if (current < line.quantity) {
        throw new ConflictException('Mock Inventory Service rejected transfer: insufficient stock');
      }
      this.change(line.productId, sourceLocationId, -line.quantity);
      this.change(line.productId, destinationLocationId, line.quantity);
    }
    this.appliedOperations.add(operationId);
  }

  async adjust(operationId: string, productId: string, locationId: string, delta: number): Promise<void> {
    if (this.appliedOperations.has(operationId)) return;
    const next = this.get(productId, locationId) + delta;
    if (next < 0) {
      throw new ConflictException('Mock Inventory Service rejected adjustment: stock cannot go below zero');
    }
    this.quantities.set(this.key(productId, locationId), next);
    this.appliedOperations.add(operationId);
  }

  async getQuantity(productId: string, locationId: string): Promise<number> {
    return this.get(productId, locationId);
  }

  private change(productId: string, locationId: string, delta: number): void {
    const next = this.get(productId, locationId) + delta;
    if (next < 0) {
      throw new ConflictException('Mock Inventory Service rejected request: insufficient stock');
    }
    this.quantities.set(this.key(productId, locationId), next);
  }

  private get(productId: string, locationId: string): number {
    return this.quantities.get(this.key(productId, locationId)) ?? 0;
  }

  private key(productId: string, locationId: string): string {
    return `${productId}:${locationId}`;
  }
}
