export interface InventoryIncrementLine {
  productId: string;
  quantity: number;
}

export interface InventoryMoveLine {
  productId: string;
  quantity: number;
}

export interface InventoryClient {
  increment(operationId: string, warehouseId: string, lines: InventoryIncrementLine[]): Promise<void>;
  decrement(operationId: string, warehouseId: string, lines: InventoryIncrementLine[]): Promise<void>;
  move(
    operationId: string,
    sourceLocationId: string,
    destinationLocationId: string,
    lines: InventoryMoveLine[],
  ): Promise<void>;
  adjust(
    operationId: string,
    productId: string,
    locationId: string,
    delta: number,
  ): Promise<void>;
  getQuantity(productId: string, locationId: string): Promise<number>;
}
