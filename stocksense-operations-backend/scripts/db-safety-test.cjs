const { Client } = require('pg');
const { randomUUID } = require('node:crypto');
require('dotenv').config();

async function assertTriggerExists(client) {
  const result = await client.query(`
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'move_history_immutable'
      AND NOT tgisinternal
    LIMIT 1
  `);

  if (result.rowCount !== 1) {
    throw new Error('MoveHistory immutability trigger is not installed');
  }
}

async function assertMutationBlocked(client, operation) {
  const id = randomUUID();
  const operationId = randomUUID();

  await client.query('BEGIN');
  try {
    await client.query(
      `
      INSERT INTO "MoveHistory" (
        "id", "operationType", "operationId", "productId", "quantityDelta", "performedBy"
      ) VALUES ($1, 'RECEIPT', $2, 'SAFETY-TEST', 1, 'safety-test')
      `,
      [id, operationId],
    );

    if (operation === 'UPDATE') {
      await client.query(
        `UPDATE "MoveHistory" SET "quantityDelta" = 2 WHERE "id" = $1`,
        [id],
      );
    } else {
      await client.query(`DELETE FROM "MoveHistory" WHERE "id" = $1`, [id]);
    }

    throw new Error(`MoveHistory ${operation} unexpectedly succeeded`);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('MoveHistory is append-only')) {
      throw error;
    }
  } finally {
    await client.query('ROLLBACK');
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await assertTriggerExists(client);
    await assertMutationBlocked(client, 'UPDATE');
    await assertMutationBlocked(client, 'DELETE');
  } finally {
    await client.end();
  }

  console.log('Database safety test passed: MoveHistory UPDATE/DELETE are blocked.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
