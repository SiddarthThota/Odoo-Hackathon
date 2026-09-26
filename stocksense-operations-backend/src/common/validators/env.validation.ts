export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'INVENTORY_SERVICE_URL'];

  for (const key of required) {
    const value = config[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  if (String(config.AUTH_DEV_BYPASS) === 'true' && String(config.NODE_ENV) === 'production') {
    throw new Error('AUTH_DEV_BYPASS must be false in production');
  }

  return config;
}
