const { Client } = require('pg');
require('dotenv').config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(`
      CREATE OR REPLACE FUNCTION prevent_move_history_mutation()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'MoveHistory is append-only and cannot be modified';
      END;
      $$;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_trigger
          WHERE tgname = 'move_history_immutable'
        ) THEN
          CREATE TRIGGER move_history_immutable
          BEFORE UPDATE OR DELETE ON "MoveHistory"
          FOR EACH ROW
          EXECUTE FUNCTION prevent_move_history_mutation();
        END IF;
      END;
      $$;
    `);
  } finally {
    await client.end();
  }

  console.log('Database safety trigger verified: MoveHistory is append-only.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
