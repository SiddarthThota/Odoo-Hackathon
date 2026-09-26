export function serializeDecimals<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => serializeDecimals(item)) as T;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, current] of Object.entries(value as Record<string, unknown>)) {
      if (current && typeof current === 'object' && typeof (current as { toNumber?: unknown }).toNumber === 'function') {
        result[key] = (current as { toNumber: () => number }).toNumber();
      } else {
        result[key] = serializeDecimals(current);
      }
    }
    return result as T;
  }

  return value;
}
