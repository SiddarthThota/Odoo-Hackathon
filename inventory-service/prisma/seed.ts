import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Users ────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const managerPassword = await bcrypt.hash('Manager@123', 12);
  const staffPassword = await bcrypt.hash('Staff@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stocksense.com' },
    update: {},
    create: {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'admin@stocksense.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@stocksense.com' },
    update: {},
    create: {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'manager@stocksense.com',
      passwordHash: managerPassword,
      role: 'MANAGER',
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@stocksense.com' },
    update: {},
    create: {
      firstName: 'Arun',
      lastName: 'Patel',
      email: 'staff@stocksense.com',
      passwordHash: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  });

  console.log('✅ Users seeded:', { admin: admin.email, manager: manager.email, staff: staff.email });

  // ── Warehouses ───────────────────────────────
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      code: 'WH-MAIN',
      name: 'Main Warehouse',
      description: 'Primary central warehouse for all inventory operations',
      address: 'Industrial Area, Plot 42',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500001',
      capacity: 20000,
      isActive: true,
    },
  });

  const prodWarehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-PROD' },
    update: {},
    create: {
      code: 'WH-PROD',
      name: 'Production Warehouse',
      description: 'Raw materials and components for production',
      address: 'MIDC Phase II',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411018',
      capacity: 15000,
      isActive: true,
    },
  });

  const fgWarehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-FG' },
    update: {},
    create: {
      code: 'WH-FG',
      name: 'Finished Goods Warehouse',
      description: 'Finished products ready for shipment',
      address: 'Logistics Park, Sector 12',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      postalCode: '122001',
      capacity: 12000,
      isActive: true,
    },
  });

  console.log('✅ Warehouses seeded');

  // ── Locations ────────────────────────────────
  const locationData = [
    // Main Warehouse locations
    { warehouseId: mainWarehouse.id, code: 'A-01', name: 'Aisle A, Rack 01', capacity: 3000 },
    { warehouseId: mainWarehouse.id, code: 'A-02', name: 'Aisle A, Rack 02', capacity: 3000 },
    { warehouseId: mainWarehouse.id, code: 'B-01', name: 'Aisle B, Rack 01', capacity: 4000 },
    { warehouseId: mainWarehouse.id, code: 'B-02', name: 'Aisle B, Rack 02', capacity: 4000 },
    { warehouseId: mainWarehouse.id, code: 'C-01', name: 'Aisle C, Rack 01', capacity: 3000 },
    { warehouseId: mainWarehouse.id, code: 'C-02', name: 'Aisle C, Rack 02', capacity: 3000 },
    // Production Warehouse locations
    { warehouseId: prodWarehouse.id, code: 'A-01', name: 'Raw Materials Zone A', capacity: 5000 },
    { warehouseId: prodWarehouse.id, code: 'A-02', name: 'Raw Materials Zone B', capacity: 5000 },
    { warehouseId: prodWarehouse.id, code: 'B-01', name: 'Components Zone A', capacity: 2500 },
    { warehouseId: prodWarehouse.id, code: 'B-02', name: 'Components Zone B', capacity: 2500 },
    // Finished Goods Warehouse locations
    { warehouseId: fgWarehouse.id, code: 'A-01', name: 'Finished Goods Zone A', capacity: 4000 },
    { warehouseId: fgWarehouse.id, code: 'A-02', name: 'Finished Goods Zone B', capacity: 4000 },
    { warehouseId: fgWarehouse.id, code: 'B-01', name: 'Dispatch Zone', capacity: 4000 },
  ];

  const locations: any[] = [];
  for (const loc of locationData) {
    const created = await prisma.location.upsert({
      where: {
        warehouseId_code: {
          warehouseId: loc.warehouseId,
          code: loc.code,
        },
      },
      update: {},
      create: {
        ...loc,
        isActive: true,
      },
    });
    locations.push(created);
  }

  console.log('✅ Locations seeded:', locations.length);

  // ── Products ─────────────────────────────────
  const productsData = [
    {
      sku: 'ELEC-WB-001',
      name: 'Wireless Buds Pro',
      description: 'Premium wireless earbuds with active noise cancellation and 36-hour battery life',
      category: 'Electronics',
      unit: 'PCS',
      price: 2500,
      cost: 1800,
      barcode: '8901234567001',
      supplier: 'Sony Electronics',
      brand: 'Sony',
      reorderLevel: 100,
      reorderQuantity: 500,
    },
    {
      sku: 'INDL-MT-002',
      name: 'Industrial Motor 5HP',
      description: 'Heavy-duty 5HP three-phase industrial motor for manufacturing',
      category: 'Industrial',
      unit: 'PCS',
      price: 45000,
      cost: 32000,
      barcode: '8901234567002',
      supplier: 'ABB India',
      brand: 'ABB',
      reorderLevel: 20,
      reorderQuantity: 50,
    },
    {
      sku: 'RAW-SR-003',
      name: 'Steel Rod 12mm',
      description: 'High-quality TMT steel rod 12mm diameter, 12m length',
      category: 'Raw Materials',
      unit: 'PCS',
      price: 850,
      cost: 620,
      barcode: '8901234567003',
      supplier: 'Tata Steel',
      brand: 'Tata',
      reorderLevel: 500,
      reorderQuantity: 2000,
    },
    {
      sku: 'PKG-BX-004',
      name: 'Packaging Box Large',
      description: 'Heavy-duty corrugated packaging box, 60x40x30 cm',
      category: 'Packaging',
      unit: 'PCS',
      price: 120,
      cost: 75,
      barcode: '8901234567004',
      supplier: 'PackRight Solutions',
      brand: 'PackRight',
      reorderLevel: 1000,
      reorderQuantity: 5000,
    },
    {
      sku: 'ELEC-LB-005',
      name: 'Lithium Battery 3.7V',
      description: '18650 rechargeable lithium-ion battery, 3000mAh',
      category: 'Electronics',
      unit: 'PCS',
      price: 350,
      cost: 220,
      barcode: '8901234567005',
      supplier: 'Samsung SDI',
      brand: 'Samsung',
      reorderLevel: 200,
      reorderQuantity: 1000,
    },
    {
      sku: 'ELEC-CP-006',
      name: 'Electronic Component Kit',
      description: 'Assorted resistors, capacitors, and ICs for PCB assembly',
      category: 'Electronics',
      unit: 'KIT',
      price: 1500,
      cost: 950,
      barcode: '8901234567006',
      supplier: 'Mouser Electronics',
      brand: 'Generic',
      reorderLevel: 50,
      reorderQuantity: 200,
    },
    {
      sku: 'INDL-VL-007',
      name: 'Control Valve DN50',
      description: '2-inch stainless steel pneumatic control valve',
      category: 'Industrial',
      unit: 'PCS',
      price: 28000,
      cost: 19500,
      barcode: '8901234567007',
      supplier: 'Emerson Process',
      brand: 'Emerson',
      reorderLevel: 10,
      reorderQuantity: 30,
    },
    {
      sku: 'RAW-CU-008',
      name: 'Copper Wire 2.5mm',
      description: 'Electrolytic grade copper wire, 2.5mm diameter, 100m coil',
      category: 'Raw Materials',
      unit: 'COIL',
      price: 6500,
      cost: 4800,
      barcode: '8901234567008',
      supplier: 'Hindustan Copper',
      brand: 'Hindalco',
      reorderLevel: 100,
      reorderQuantity: 400,
    },
    {
      sku: 'PKG-TP-009',
      name: 'Packaging Tape Heavy Duty',
      description: 'Brown packaging tape, 72mm x 100m, high adhesion',
      category: 'Packaging',
      unit: 'ROLL',
      price: 180,
      cost: 110,
      barcode: '8901234567009',
      supplier: '3M India',
      brand: '3M',
      reorderLevel: 300,
      reorderQuantity: 1000,
    },
    {
      sku: 'ELEC-CB-010',
      name: 'USB-C Cable Braided',
      description: 'Premium braided USB-C to USB-C cable, 2m, 100W PD',
      category: 'Electronics',
      unit: 'PCS',
      price: 450,
      cost: 280,
      barcode: '8901234567010',
      supplier: 'Anker Innovation',
      brand: 'Anker',
      reorderLevel: 150,
      reorderQuantity: 600,
    },
  ];

  const products: any[] = [];
  for (const prod of productsData) {
    const created = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        ...prod,
        isActive: true,
      },
    });
    products.push(created);
  }

  console.log('✅ Products seeded:', products.length);

  // ── Stock ────────────────────────────────────
  // Get locations by warehouse for convenience
  const mainLocs = locations.filter((l) => l.warehouseId === mainWarehouse.id);
  const prodLocs = locations.filter((l) => l.warehouseId === prodWarehouse.id);
  const fgLocs = locations.filter((l) => l.warehouseId === fgWarehouse.id);

  const stockData = [
    // Wireless Buds - Main WH
    { productId: products[0].id, warehouseId: mainWarehouse.id, locationId: mainLocs[0].id, quantity: 480, reserved: 60 },
    { productId: products[0].id, warehouseId: fgWarehouse.id, locationId: fgLocs[0].id, quantity: 760, reserved: 120 },
    // Industrial Motor - Main WH
    { productId: products[1].id, warehouseId: mainWarehouse.id, locationId: mainLocs[2].id, quantity: 35, reserved: 5 },
    { productId: products[1].id, warehouseId: prodWarehouse.id, locationId: prodLocs[0].id, quantity: 15, reserved: 3 },
    // Steel Rod - Production WH
    { productId: products[2].id, warehouseId: prodWarehouse.id, locationId: prodLocs[0].id, quantity: 2800, reserved: 200 },
    { productId: products[2].id, warehouseId: mainWarehouse.id, locationId: mainLocs[3].id, quantity: 1200, reserved: 100 },
    // Packaging Box - Main WH
    { productId: products[3].id, warehouseId: mainWarehouse.id, locationId: mainLocs[1].id, quantity: 3500, reserved: 300 },
    { productId: products[3].id, warehouseId: fgWarehouse.id, locationId: fgLocs[1].id, quantity: 1500, reserved: 150 },
    // Lithium Battery - Production WH
    { productId: products[4].id, warehouseId: prodWarehouse.id, locationId: prodLocs[2].id, quantity: 1800, reserved: 100 },
    { productId: products[4].id, warehouseId: mainWarehouse.id, locationId: mainLocs[4].id, quantity: 600, reserved: 50 },
    // Electronic Component Kit
    { productId: products[5].id, warehouseId: prodWarehouse.id, locationId: prodLocs[3].id, quantity: 180, reserved: 20 },
    // Control Valve - low stock scenario
    { productId: products[6].id, warehouseId: mainWarehouse.id, locationId: mainLocs[5].id, quantity: 8, reserved: 2 },
    // Copper Wire
    { productId: products[7].id, warehouseId: prodWarehouse.id, locationId: prodLocs[1].id, quantity: 350, reserved: 25 },
    { productId: products[7].id, warehouseId: mainWarehouse.id, locationId: mainLocs[0].id, quantity: 120, reserved: 10 },
    // Packaging Tape
    { productId: products[8].id, warehouseId: mainWarehouse.id, locationId: mainLocs[1].id, quantity: 850, reserved: 50 },
    { productId: products[8].id, warehouseId: fgWarehouse.id, locationId: fgLocs[2].id, quantity: 400, reserved: 30 },
    // USB-C Cable
    { productId: products[9].id, warehouseId: mainWarehouse.id, locationId: mainLocs[4].id, quantity: 90, reserved: 10 },
    { productId: products[9].id, warehouseId: fgWarehouse.id, locationId: fgLocs[0].id, quantity: 250, reserved: 20 },
  ];

  for (const stock of stockData) {
    await prisma.stock.upsert({
      where: {
        productId_warehouseId_locationId: {
          productId: stock.productId,
          warehouseId: stock.warehouseId,
          locationId: stock.locationId,
        },
      },
      update: {},
      create: {
        productId: stock.productId,
        warehouseId: stock.warehouseId,
        locationId: stock.locationId,
        quantity: stock.quantity,
        reservedQuantity: stock.reserved,
        availableQuantity: stock.quantity - stock.reserved,
      },
    });
  }

  console.log('✅ Stock records seeded:', stockData.length);

  // ── Reorder Rules ────────────────────────────
  const reorderRulesData = [
    { productId: products[0].id, warehouseId: mainWarehouse.id, minimumStock: 100, maximumStock: 1000, reorderQuantity: 500 },
    { productId: products[1].id, warehouseId: mainWarehouse.id, minimumStock: 20, maximumStock: 100, reorderQuantity: 50 },
    { productId: products[2].id, warehouseId: prodWarehouse.id, minimumStock: 500, maximumStock: 5000, reorderQuantity: 2000 },
    { productId: products[3].id, warehouseId: mainWarehouse.id, minimumStock: 1000, maximumStock: 8000, reorderQuantity: 5000 },
    { productId: products[4].id, warehouseId: prodWarehouse.id, minimumStock: 200, maximumStock: 3000, reorderQuantity: 1000 },
    { productId: products[6].id, warehouseId: mainWarehouse.id, minimumStock: 10, maximumStock: 50, reorderQuantity: 30 },
    { productId: products[9].id, warehouseId: mainWarehouse.id, minimumStock: 150, maximumStock: 1000, reorderQuantity: 600 },
  ];

  for (const rule of reorderRulesData) {
    await prisma.reorderRule.upsert({
      where: {
        productId_warehouseId: {
          productId: rule.productId,
          warehouseId: rule.warehouseId,
        },
      },
      update: {},
      create: {
        ...rule,
        isActive: true,
      },
    });
  }

  console.log('✅ Reorder rules seeded:', reorderRulesData.length);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:   admin@stocksense.com   / Admin@123');
  console.log('   Manager: manager@stocksense.com / Manager@123');
  console.log('   Staff:   staff@stocksense.com   / Staff@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
