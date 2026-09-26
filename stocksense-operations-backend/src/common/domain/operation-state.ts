export type OperationStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED';

const transitions: Record<OperationStatus, readonly OperationStatus[]> = {
  DRAFT: ['WAITING', 'CANCELED'],
  WAITING: ['READY', 'CANCELED'],
  READY: ['DONE', 'CANCELED'],
  DONE: [],
  CANCELED: [],
};

export function canTransition(from: OperationStatus, to: OperationStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: OperationStatus, to: OperationStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid operation status transition: ${from} -> ${to}`);
  }
}

export function calculateAdjustmentDelta(recordedQty: number, countedQty: number): number {
  return countedQty - recordedQty;
}

export function isTerminalStatus(status: OperationStatus): boolean {
  return status === 'DONE' || status === 'CANCELED';
}

export function isNonTerminalStatus(status: OperationStatus): boolean {
  return !isTerminalStatus(status);
}
