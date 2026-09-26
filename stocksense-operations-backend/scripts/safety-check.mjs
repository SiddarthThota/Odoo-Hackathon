import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const fail = (message) => {
  throw new Error(message);
};

const controllers = {
  receipts: read('src/receipts/receipts.controller.ts'),
  deliveries: read('src/deliveries/deliveries.controller.ts'),
  transfers: read('src/transfers/transfers.controller.ts'),
  adjustments: read('src/adjustments/adjustments.controller.ts'),
  history: read('src/move-history/move-history.controller.ts'),
};

const managerOnlyPairs = [
  [controllers.receipts, "@Post(':id/validate')", 'receipts validate'],
  [controllers.receipts, "@Post(':id/cancel')", 'receipts cancel'],
  [controllers.receipts, "@Delete(':id')", 'receipts delete'],
  [controllers.deliveries, "@Post(':id/validate')", 'deliveries validate'],
  [controllers.deliveries, "@Post(':id/cancel')", 'deliveries cancel'],
  [controllers.transfers, "@Post(':id/validate')", 'transfers validate'],
  [controllers.transfers, "@Post(':id/cancel')", 'transfers cancel'],
  [controllers.adjustments, "@Post(':id/apply')", 'adjustments apply'],
];

for (const [source, route, label] of managerOnlyPairs) {
  const routeIndex = source.indexOf(route);

  if (routeIndex < 0) {
    fail(`${label} route declaration is missing`);
  }

  const nextHundred = source.slice(routeIndex, routeIndex + 240);

  if (!nextHundred.includes("@Roles('InventoryManager')")) {
    fail(`${label} is not manager restricted`);
  }
}

for (const mutation of ['@Post', '@Patch', '@Delete']) {
  if (controllers.history.includes(mutation)) {
    fail(`Move History exposes mutation endpoint: ${mutation}`);
  }
}

if (
  controllers.history.includes('create(') ||
  controllers.history.includes('update(') ||
  controllers.history.includes('remove(')
) {
  fail('Move History controller exposes a mutation handler');
}

const authGuard = read('src/common/guards/jwt-auth.guard.ts');

if (!authGuard.includes("'production'")) {
  fail('JWT dev-bypass production safeguard missing');
}

if (!authGuard.includes('Bearer token is required')) {
  fail('JWT bearer-token enforcement missing');
}

const inventoryClient = read(
  'src/inventory-client/http-inventory.client.ts',
);

for (const route of [
  '/stock/increment',
  '/stock/decrement',
  '/stock/move',
  '/stock/adjust',
]) {
  if (!inventoryClient.includes(route)) {
    fail(`Missing downstream route: ${route}`);
  }
}

const migration = read(
  'prisma/migrations/20260926000000_init_operations/migration.sql',
);

if (
  !migration.includes(
    'CREATE UNIQUE INDEX "MoveHistory_operationType_operationId_productId_key"',
  )
) {
  fail('MoveHistory idempotency uniqueness index is missing from migration');
}

const safetyScript = read('scripts/ensure-db-safety.cjs');

if (!safetyScript.includes('move_history_immutable')) {
  fail('MoveHistory database immutability trigger is missing');
}

const main = read('src/main.ts');

if (!main.includes("app.setGlobalPrefix('api/v1/operations'")) {
  fail('Operations API prefix is incorrect');
}

if (!main.includes("path: 'health'")) {
  fail('Health route is not excluded from operations prefix');
}

const env = read('.env.example');

if (!env.includes('PORT="3001"')) {
  fail(
    'Backend default port must be 3001 so it can coexist with the Next.js frontend on 3000',
  );
}

if (
  !controllers.deliveries.includes(
    "@Roles('WarehouseStaff', 'InventoryManager')",
  )
) {
  fail(
    'Delivery picking/packing must be allowed for WarehouseStaff and InventoryManager',
  );
}

const correlation = read(
  'src/inventory-client/http-inventory.client.ts',
);

if (!correlation.includes("'x-correlation-id'")) {
  fail(
    'Inventory Service requests must propagate correlation ID',
  );
}

const mutationChecks = [
  [
    'receipt',
    read('src/receipts/receipts.service.ts'),
    'increment',
  ],
  [
    'delivery',
    read('src/deliveries/deliveries.service.ts'),
    'decrement',
  ],
  [
    'transfer',
    read('src/transfers/transfers.service.ts'),
    'move',
  ],
  [
    'adjustment',
    read('src/adjustments/adjustments.service.ts'),
    'adjust',
  ],
];

for (const [label, source, inventoryMethod] of mutationChecks) {
  const inventoryPattern = new RegExp(
    `await\\s+this\\.inventory\\.${inventoryMethod}\\s*\\(`,
  );

  const donePattern =
    /status\s*:\s*OperationStatus\.DONE/;

  const inventoryMatch = inventoryPattern.exec(source);
  const doneMatch = donePattern.exec(source);

  if (!inventoryMatch) {
    fail(
      `${label} validation is missing the Inventory Service ${inventoryMethod} mutation call`,
    );
  }

  if (!doneMatch) {
    fail(
      `${label} validation is missing the OperationStatus.DONE assignment`,
    );
  }

  if (inventoryMatch.index > doneMatch.index) {
    fail(
      `${label} can mark DONE before its inventory mutation call`,
    );
  }
}

console.log('Safety checks passed.');