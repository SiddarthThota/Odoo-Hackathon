describe('operation reference format', () => {
  it.each([
    ['REC', 'REC-2026-0001'],
    ['DEL', 'DEL-2026-0042'],
    ['INT', 'INT-2026-0100'],
  ])('formats %s references consistently', (prefix, expected) => {
    const value =  Number(expected.slice(-4));
    const actual = `${prefix}-2026-${String(value).padStart(4, '0')}`;
    expect(actual).toBe(expected);
  });
});
