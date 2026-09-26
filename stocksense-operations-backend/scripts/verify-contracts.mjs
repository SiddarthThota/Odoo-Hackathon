import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  const filePath = path.join(root, relativePath);

  if (!fs.existsSync(filePath)) {
    fail(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function assertCallBeforeDone(
  source,
  callNeedle,
  label,
) {
  const callIndex = source.indexOf(callNeedle);

  if (callIndex === -1) {
    fail(`${label} does not call required downstream operation`);
  }

  /*
   * Don't depend on formatting such as:
   *
   *   status: OperationStatus.DONE
   *
   * The source may legally format the same expression as:
   *
   *   status:
   *     OperationStatus.DONE
   *
   * or use another multiline object layout.
   *
   * The Operations requirement is ordering:
   * downstream Inventory operation -> DONE.
   */
  const doneIndex = source.indexOf(
    'OperationStatus.DONE',
    callIndex,
  );

  if (doneIndex === -1) {
    fail(`${label} does not contain a DONE transition`);
  }

  if (callIndex > doneIndex) {
    fail(
      `${label} can reach DONE before the downstream Inventory operation`,
    );
  }
}

const requiredFiles = [
  'src/main.ts',
  'src/app.module.ts',
  'src/prisma/prisma.service.ts',

  'src/common/correlation-id.context.ts',
  'src/common/correlation-id.middleware.ts',

  'scripts/db-safety-test.cjs',

  'src/receipts/receipts.controller.ts',
  'src/receipts/receipts.service.ts',

  'src/deliveries/deliveries.controller.ts',
  'src/deliveries/deliveries.service.ts',

  'src/transfers/transfers.controller.ts',
  'src/transfers/transfers.service.ts',

  'src/adjustments/adjustments.controller.ts',
  'src/adjustments/adjustments.service.ts',

  'src/move-history/move-history.controller.ts',
  'src/move-history/move-history.service.ts',

  'src/stats/stats.controller.ts',
  'src/stats/stats.service.ts',

  'src/inventory-client/inventory-client.module.ts',
  'src/inventory-client/http-inventory.client.ts',
  'src/inventory-client/mock-inventory.client.ts',

  'prisma/schema.prisma',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    fail(`Missing required file: ${file}`);
  }
}

//
// ------------------------------------------------------------
// Prisma schema / service boundary
// ------------------------------------------------------------
//

const schema = read('prisma/schema.prisma');

for (const model of [
  'Receipt',
  'ReceiptLine',
  'Delivery',
  'DeliveryLine',
  'Transfer',
  'TransferLine',
  'Adjustment',
  'MoveHistory',
  'DocumentCounter',
]) {
  if (!schema.includes(`model ${model}`)) {
    fail(`Missing Prisma model: ${model}`);
  }
}

for (const forbidden of [
  'model Product',
  'model Warehouse',
  'model Location',
  'model Stock',
]) {
  if (schema.includes(forbidden)) {
    fail(
      `Operations boundary violated: ${forbidden}`,
    );
  }
}

for (const field of [
  'operationType',
  'operationId',
  'quantityDelta',
  'fromLocationId',
  'toLocationId',
]) {
  if (!schema.includes(field)) {
    fail(`MoveHistory field missing: ${field}`);
  }
}

if (
  !schema.includes(
    '@@unique([operationType, operationId, productId])',
  )
) {
  fail(
    'MoveHistory idempotency uniqueness safeguard missing',
  );
}

//
// ------------------------------------------------------------
// Controller/service consistency
// ------------------------------------------------------------
//

const controllers = {
  receipts: [
    'src/receipts/receipts.controller.ts',
    'src/receipts/receipts.service.ts',
  ],

  deliveries: [
    'src/deliveries/deliveries.controller.ts',
    'src/deliveries/deliveries.service.ts',
  ],

  transfers: [
    'src/transfers/transfers.controller.ts',
    'src/transfers/transfers.service.ts',
  ],

  adjustments: [
    'src/adjustments/adjustments.controller.ts',
    'src/adjustments/adjustments.service.ts',
  ],

  history: [
    'src/move-history/move-history.controller.ts',
    'src/move-history/move-history.service.ts',
  ],

  stats: [
    'src/stats/stats.controller.ts',
    'src/stats/stats.service.ts',
  ],
};

for (const [
  name,
  [controllerFile, serviceFile],
] of Object.entries(controllers)) {
  const controller = read(controllerFile);
  const service = read(serviceFile);

  if (!controller.includes('@Controller(')) {
    fail(
      `${name} controller missing @Controller`,
    );
  }

  const calls = [
    ...controller.matchAll(
      /this\.[A-Za-z]+Service\.([A-Za-z_$][\w$]*)\(/g,
    ),
  ].map((match) => match[1]);

  for (const method of new Set(calls)) {
    const methodPattern = new RegExp(
      `(?:async\\s+)?${method}\\s*\\(`,
    );

    if (!methodPattern.test(service)) {
      fail(
        `${name} controller calls service.${method}(), but service method is missing`,
      );
    }
  }
}

//
// ------------------------------------------------------------
// Route manifest
// ------------------------------------------------------------
//

function routeManifest(controllerFile) {
  const source = read(controllerFile);

  const controllerMatch = source.match(
    /@Controller\((?:'|")([^'"]*)(?:'|")\)/,
  );

  if (!controllerMatch) {
    fail(
      `Missing controller prefix in ${controllerFile}`,
    );
  }

  const controllerPrefix =
    controllerMatch[1]
      .replace(/^\//, '')
      .replace(/\/$/, '');

  const routes = [];

  const routeRegex =
    /@(Get|Post|Patch|Delete)\((?:'([^'"]*)'|\s*)?\)/g;

  for (const match of source.matchAll(
    routeRegex,
  )) {
    const pathPart =
      (match[2] ?? '')
        .replace(/^\//, '')
        .replace(/\/$/, '');

    const routePath =
      `/api/v1/operations/${controllerPrefix}${
        pathPart
          ? `/${pathPart}`
          : ''
      }`.replace(/\/+/g, '/');

    routes.push({
      method: match[1].toUpperCase(),
      path: routePath,
    });
  }

  return routes;
}

const allControllers =
  Object.values(controllers).map(
    ([controllerFile]) => controllerFile,
  );

const routes = allControllers.flatMap(
  routeManifest,
);

const routeKeys = routes.map(
  (route) =>
    `${route.method} ${route.path}`,
);

const duplicateRoutes =
  routeKeys.filter(
    (route, index) =>
      routeKeys.indexOf(route) !==
      index,
  );

if (duplicateRoutes.length) {
  fail(
    `Duplicate routes detected: ${[
      ...new Set(duplicateRoutes),
    ].join(', ')}`,
  );
}

//
// ------------------------------------------------------------
// Required routes from Operations specification
// ------------------------------------------------------------
//

const routeAssertions = [
  // Receipts
  [
    'src/receipts/receipts.controller.ts',
    '@Get()',
    'receipts GET list',
  ],
  [
    'src/receipts/receipts.controller.ts',
    "@Get(':id')",
    'receipts GET detail',
  ],
  [
    'src/receipts/receipts.controller.ts',
    '@Post()',
    'receipts POST create',
  ],
  [
    'src/receipts/receipts.controller.ts',
    "@Patch(':id')",
    'receipts PATCH update',
  ],
  [
    'src/receipts/receipts.controller.ts',
    "@Post(':id/submit')",
    'receipts submit',
  ],
  [
    'src/receipts/receipts.controller.ts',
    "@Post(':id/validate')",
    'receipts validate',
  ],
  [
    'src/receipts/receipts.controller.ts',
    "@Post(':id/cancel')",
    'receipts cancel',
  ],
  [
    'src/receipts/receipts.controller.ts',
    "@Delete(':id')",
    'receipts delete',
  ],

  // Deliveries
  [
    'src/deliveries/deliveries.controller.ts',
    '@Get()',
    'deliveries GET list',
  ],
  [
    'src/deliveries/deliveries.controller.ts',
    "@Get(':id')",
    'deliveries GET detail',
  ],
  [
    'src/deliveries/deliveries.controller.ts',
    '@Post()',
    'deliveries POST create',
  ],
  [
    'src/deliveries/deliveries.controller.ts',
    "@Patch(':id')",
    'deliveries PATCH update',
  ],
  [
    'src/deliveries/deliveries.controller.ts',
    "@Post(':id/pick')",
    'deliveries pick',
  ],
  [
    'src/deliveries/deliveries.controller.ts',
    "@Post(':id/pack')",
    'deliveries pack',
  ],
  [
    'src/deliveries/deliveries.controller.ts',
    "@Post(':id/validate')",
    'deliveries validate',
  ],
  [
    'src/deliveries/deliveries.controller.ts',
    "@Post(':id/cancel')",
    'deliveries cancel',
  ],

  // Transfers
  [
    'src/transfers/transfers.controller.ts',
    '@Get()',
    'transfers GET list',
  ],
  [
    'src/transfers/transfers.controller.ts',
    "@Get(':id')",
    'transfers GET detail',
  ],
  [
    'src/transfers/transfers.controller.ts',
    '@Post()',
    'transfers POST create',
  ],
  [
    'src/transfers/transfers.controller.ts',
    "@Post(':id/validate')",
    'transfers validate',
  ],
  [
    'src/transfers/transfers.controller.ts',
    "@Post(':id/cancel')",
    'transfers cancel',
  ],

  // Adjustments
  [
    'src/adjustments/adjustments.controller.ts',
    '@Get()',
    'adjustments GET list',
  ],
  [
    'src/adjustments/adjustments.controller.ts',
    "@Get(':id')",
    'adjustments GET detail',
  ],
  [
    'src/adjustments/adjustments.controller.ts',
    '@Post()',
    'adjustments POST create',
  ],
  [
    'src/adjustments/adjustments.controller.ts',
    "@Post(':id/apply')",
    'adjustments apply',
  ],

  // Move history
  [
    'src/move-history/move-history.controller.ts',
    '@Get()',
    'move history GET list',
  ],
  [
    'src/move-history/move-history.controller.ts',
    "@Get(':id')",
    'move history GET detail',
  ],

  // Stats
  [
    'src/stats/stats.controller.ts',
    "@Get('summary')",
    'stats summary',
  ],
  [
    'src/stats/stats.controller.ts',
    "@Get('by-status')",
    'stats by status',
  ],
  [
    'src/stats/stats.controller.ts',
    "@Get('recent-activity')",
    'stats recent activity',
  ],
];

for (const [
  file,
  needle,
  label,
] of routeAssertions) {
  if (!read(file).includes(needle)) {
    fail(`Missing ${label}`);
  }
}

//
// ------------------------------------------------------------
// Duplicate source directories
// ------------------------------------------------------------
//

for (const duplicate of [
  '.src',
  'src/src',
]) {
  if (
    fs.existsSync(
      path.join(root, duplicate),
    )
  ) {
    fail(
      `Duplicate source directory detected: ${duplicate}`,
    );
  }
}

//
// ------------------------------------------------------------
// Receipt → Inventory → DONE
// ------------------------------------------------------------
//

const receiptService = read(
  'src/receipts/receipts.service.ts',
);

assertCallBeforeDone(
  receiptService,
  'await this.inventory.increment',
  'Receipt validation',
);

if (
  !receiptService.includes(
    'toLocationId: null',
  )
) {
  fail(
    'Receipt history must not invent a location ID for warehouse-level receipt',
  );
}

//
// ------------------------------------------------------------
// Delivery → Inventory → DONE
// ------------------------------------------------------------
//

const deliveryService = read(
  'src/deliveries/deliveries.service.ts',
);

assertCallBeforeDone(
  deliveryService,
  'await this.inventory.decrement',
  'Delivery validation',
);

//
// ------------------------------------------------------------
// Transfer → atomic Inventory move → DONE
// ------------------------------------------------------------
//

const transferService = read(
  'src/transfers/transfers.service.ts',
);

if (
  (
    transferService.match(
      /this\.inventory\.move\(/g,
    ) ?? []
  ).length !== 1
) {
  fail(
    'Transfer must use exactly one atomic Inventory Service move call',
  );
}

if (
  transferService.includes(
    'this.inventory.increment(',
  ) ||
  transferService.includes(
    'this.inventory.decrement(',
  )
) {
  fail(
    'Transfer must not implement relocation as increment/decrement calls',
  );
}

assertCallBeforeDone(
  transferService,
  'await this.inventory.move',
  'Transfer validation',
);

//
// ------------------------------------------------------------
// Adjustment → Inventory adjustment → DONE
// ------------------------------------------------------------
//

const adjustmentService = read(
  'src/adjustments/adjustments.service.ts',
);

if (
  !adjustmentService.includes(
    'this.inventory.getQuantity(dto.productId, dto.locationId)',
  )
) {
  fail(
    'Adjustment must snapshot live recorded quantity from Inventory Service',
  );
}

assertCallBeforeDone(
  adjustmentService,
  'await this.inventory.adjust',
  'Adjustment application',
);

//
// ------------------------------------------------------------
// Move History must be read-only
// ------------------------------------------------------------
//

const historyController = read(
  'src/move-history/move-history.controller.ts',
);

for (const mutation of [
  '@Post',
  '@Patch',
  '@Delete',
]) {
  if (historyController.includes(mutation)) {
    fail(
      `Move History exposes mutation endpoint: ${mutation}`,
    );
  }
}

//
// ------------------------------------------------------------
// JWT security
// ------------------------------------------------------------
//

const authGuard = read(
  'src/common/guards/jwt-auth.guard.ts',
);

if (
  !authGuard.includes(
    "nodeEnv !== 'production'",
  )
) {
  fail(
    'JWT dev-bypass production safeguard missing',
  );
}

if (
  !authGuard.includes(
    'Bearer token is required',
  )
) {
  fail(
    'JWT bearer-token enforcement missing',
  );
}

//
// ------------------------------------------------------------
// Inventory client contract
// ------------------------------------------------------------
//

const inventoryClient = read(
  'src/inventory-client/http-inventory.client.ts',
);

for (const route of [
  '/stock/increment',
  '/stock/decrement',
  '/stock/move',
  '/stock/adjust',
  '/stock/quantity',
]) {
  if (!inventoryClient.includes(route)) {
    fail(
      `Missing downstream route: ${route}`,
    );
  }
}

if (
  !inventoryClient.includes(
    'x-idempotency-key',
  )
) {
  fail(
    'Downstream idempotency key header missing',
  );
}

if (
  !inventoryClient.includes(
    'x-correlation-id',
  )
) {
  fail(
    'Correlation ID is not propagated downstream',
  );
}

//
// ------------------------------------------------------------
// Migration safety
// ------------------------------------------------------------
//

const migrationRoot = path.join(
  root,
  'prisma',
  'migrations',
);

if (!fs.existsSync(migrationRoot)) {
  fail(
    'Prisma migrations directory is missing',
  );
}

const migrationDirectories =
  fs
    .readdirSync(migrationRoot)
    .filter((name) =>
      fs.statSync(
        path.join(
          migrationRoot,
          name,
        ),
      ).isDirectory(),
    )
    .sort();

if (migrationDirectories.length === 0) {
  fail(
    'No Prisma migration directory found',
  );
}

const migrationFile =
  path.join(
    migrationRoot,
    migrationDirectories[
      migrationDirectories.length - 1
    ],
    'migration.sql',
  );

if (!fs.existsSync(migrationFile)) {
  fail(
    `Latest Prisma migration SQL missing: ${migrationFile}`,
  );
}

const migration =
  fs.readFileSync(
    migrationFile,
    'utf8',
  );

if (
  !migration.includes(
    'MoveHistory_operationType_operationId_productId_key',
  )
) {
  fail(
    'MoveHistory idempotency uniqueness index is missing from migration',
  );
}

if (
  !migration.includes(
    'move_history_immutable',
  )
) {
  fail(
    'MoveHistory immutability trigger is missing from migration',
  );
}

//
// ------------------------------------------------------------
// Application prefix / health route
// ------------------------------------------------------------
//

const main = read(
  'src/main.ts',
);

if (
  !main.includes(
    "app.setGlobalPrefix('api/v1/operations'",
  )
) {
  fail(
    'Operations API prefix is incorrect',
  );
}

if (
  !main.includes(
    "path: 'health'",
  )
) {
  fail(
    'Health route is not excluded from operations prefix',
  );
}

//
// ------------------------------------------------------------
// Environment contract
// ------------------------------------------------------------
//

const env = read(
  '.env.example',
);

for (const key of [
  'DATABASE_URL',
  'JWT_SECRET',
  'INVENTORY_SERVICE_URL',
  'PORT',
  'CORS_ORIGIN',
]) {
  if (
    !env.includes(`${key}=`)
  ) {
    fail(
      `Missing env setting: ${key}`,
    );
  }
}

if (
  !env.includes(
    'PORT="3001"',
  )
) {
  fail(
    'Backend default port must be 3001',
  );
}

console.log(
  'Static contract verification passed.',
);