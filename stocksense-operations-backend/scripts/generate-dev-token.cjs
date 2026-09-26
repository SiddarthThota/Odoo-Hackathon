require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET is required');
}

const role = process.argv[2] || 'InventoryManager';
const sub = process.argv[3] || 'dev-user';

if (!['InventoryManager', 'WarehouseStaff'].includes(role)) {
  throw new Error('Role must be InventoryManager or WarehouseStaff');
}

const token = jwt.sign(
  { sub, role },
  secret,
  { expiresIn: '1h' },
);

console.log(token);
