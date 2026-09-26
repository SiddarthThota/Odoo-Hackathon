import {
  assertTransition,
  calculateAdjustmentDelta,
  canTransition,
  isNonTerminalStatus,
  isTerminalStatus,
} from '../src/common/domain/operation-state';

describe('operation state machine', () => {
  it('allows the documented lifecycle transitions', () => {
    expect(canTransition('DRAFT', 'WAITING')).toBe(true);
    expect(canTransition('WAITING', 'READY')).toBe(true);
    expect(canTransition('READY', 'DONE')).toBe(true);
    expect(canTransition('READY', 'CANCELED')).toBe(true);
  });

  it('rejects terminal-state mutations', () => {
    expect(canTransition('DONE', 'READY')).toBe(false);
    expect(canTransition('CANCELED', 'DRAFT')).toBe(false);
    expect(() => assertTransition('DONE', 'CANCELED')).toThrow();
  });

  it('calculates adjustment delta correctly', () => {
    expect(calculateAdjustmentDelta(100, 97)).toBe(-3);
    expect(calculateAdjustmentDelta(97, 100)).toBe(3);
  });

  it('identifies terminal and active statuses', () => {
    expect(isTerminalStatus('DONE')).toBe(true);
    expect(isTerminalStatus('CANCELED')).toBe(true);
    expect(isNonTerminalStatus('DRAFT')).toBe(true);
    expect(isNonTerminalStatus('READY')).toBe(true);
  });
});
