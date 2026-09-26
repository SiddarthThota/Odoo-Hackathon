import { create } from 'zustand';
import { api } from '@/lib/axios';

// ─── Types matching the operations backend Prisma schema ─────────
export type OperationType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';
export type OperationStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED';

// Generic operation record for frontend display (flattened view)
export interface OperationRecord {
  id: string;
  reference_number: string;
  operation_type: OperationType;
  status: OperationStatus;
  source_or_party: string;
  destination_or_warehouse: string;
  location: string;
  product: string;
  quantity: number;
  direction: 'IN' | 'OUT' | 'TRANSFER';
  reason: string;
  operation_date: string;
  created_by: string;
}

interface OperationsState {
  operations: OperationRecord[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  addOperation: (op: Omit<OperationRecord, 'id' | 'reference_number'>) => void;
  updateOperation: (id: string, updates: Partial<OperationRecord>) => void;
  deleteOperation: (id: string) => void;
}

// ─── Map backend models to our flat OperationRecord ──────────────

function mapReceipt(r: any): OperationRecord {
  const firstLine = r.lines?.[0];
  return {
    id: r.id,
    reference_number: r.referenceNo,
    operation_type: 'RECEIPT',
    status: mapStatus(r.status),
    source_or_party: r.supplierRef || '',
    destination_or_warehouse: r.warehouseId || '',
    location: '',
    product: firstLine?.productId || 'Multiple Items',
    quantity: firstLine ? Number(firstLine.expectedQty) : 0,
    direction: 'IN',
    reason: 'PURCHASE',
    operation_date: r.scheduledDate?.split('T')[0] || r.createdAt?.split('T')[0] || '',
    created_by: r.createdBy || 'system',
  };
}

function mapDelivery(d: any): OperationRecord {
  const firstLine = d.lines?.[0];
  return {
    id: d.id,
    reference_number: d.referenceNo,
    operation_type: 'DELIVERY',
    status: mapStatus(d.status),
    source_or_party: d.customerRef || '',
    destination_or_warehouse: d.warehouseId || '',
    location: '',
    product: firstLine?.productId || 'Multiple Items',
    quantity: firstLine ? Number(firstLine.expectedQty) : 0,
    direction: 'OUT',
    reason: 'SALE',
    operation_date: d.scheduledDate?.split('T')[0] || d.createdAt?.split('T')[0] || '',
    created_by: d.createdBy || 'system',
  };
}

function mapTransfer(t: any): OperationRecord {
  const firstLine = t.lines?.[0];
  return {
    id: t.id,
    reference_number: t.referenceNo,
    operation_type: 'TRANSFER',
    status: mapStatus(t.status),
    source_or_party: t.sourceLocationId || '',
    destination_or_warehouse: t.destinationLocationId || '',
    location: `${t.sourceLocationId} → ${t.destinationLocationId}`,
    product: firstLine?.productId || 'Multiple Items',
    quantity: firstLine ? Number(firstLine.quantity) : 0,
    direction: 'TRANSFER',
    reason: 'WAREHOUSE_TRANSFER',
    operation_date: t.createdAt?.split('T')[0] || '',
    created_by: t.createdBy || 'system',
  };
}

function mapAdjustment(a: any): OperationRecord {
  return {
    id: a.id,
    reference_number: `ADJ-${a.id.slice(0, 8)}`,
    operation_type: 'ADJUSTMENT',
    status: mapStatus(a.status),
    source_or_party: a.locationId || '',
    destination_or_warehouse: a.locationId || '',
    location: a.locationId || '',
    product: a.productId || '',
    quantity: Math.abs(Number(a.delta)),
    direction: Number(a.delta) >= 0 ? 'IN' : 'OUT',
    reason: a.reason || 'ADJUSTMENT',
    operation_date: a.createdAt?.split('T')[0] || '',
    created_by: a.createdBy || 'system',
  };
}

// Map backend status names to our frontend status names
function mapStatus(backendStatus: string): OperationStatus {
  const map: Record<string, OperationStatus> = {
    'DRAFT': 'DRAFT',
    'WAITING': 'WAITING',
    'READY': 'READY',
    'DONE': 'DONE',
    'CANCELED': 'CANCELED',
  };
  return map[backendStatus] || 'DRAFT';
}

// ─── Seed data for when backend has no records yet ───────────────
const seedData: OperationRecord[] = [
  { id: 'WH/IN/001', reference_number: 'WH/IN/001', operation_type: 'RECEIPT', status: 'DONE', source_or_party: 'Medico Distributors', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-01', product: 'Paracetamol 500mg', quantity: 100, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-01', created_by: 'admin' },
  { id: 'WH/IN/002', reference_number: 'WH/IN/002', operation_type: 'RECEIPT', status: 'DONE', source_or_party: 'Apollo Pharma Supply', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-02', product: 'Amoxicillin 500mg', quantity: 80, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-02', created_by: 'manager' },
  { id: 'WH/IN/003', reference_number: 'WH/IN/003', operation_type: 'RECEIPT', status: 'DONE', source_or_party: 'HealthPlus Distributors', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-01', product: 'Cetirizine 10mg', quantity: 120, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-03', created_by: 'staff' },
  { id: 'WH/IN/004', reference_number: 'WH/IN/004', operation_type: 'RECEIPT', status: 'READY', source_or_party: 'MediSource India', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-03', product: 'Azithromycin 500mg', quantity: 60, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-05', created_by: 'manager' },
  { id: 'WH/IN/005', reference_number: 'WH/IN/005', operation_type: 'RECEIPT', status: 'WAITING', source_or_party: 'CareMed Suppliers', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-02', product: 'Ibuprofen 400mg', quantity: 90, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-07', created_by: 'staff' },
  { id: 'WH/OUT/001', reference_number: 'WH/OUT/001', operation_type: 'DELIVERY', status: 'DONE', source_or_party: 'ABC Clinic', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-01', product: 'Paracetamol 500mg', quantity: 30, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-04', created_by: 'staff' },
  { id: 'WH/OUT/002', reference_number: 'WH/OUT/002', operation_type: 'DELIVERY', status: 'DONE', source_or_party: 'CityCare Hospital', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-02', product: 'Amoxicillin 500mg', quantity: 20, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-06', created_by: 'manager' },
  { id: 'WH/OUT/003', reference_number: 'WH/OUT/003', operation_type: 'DELIVERY', status: 'READY', source_or_party: 'GreenCross Clinic', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-01', product: 'Cetirizine 10mg', quantity: 25, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-08', created_by: 'manager' },
  { id: 'WH/OUT/004', reference_number: 'WH/OUT/004', operation_type: 'DELIVERY', status: 'WAITING', source_or_party: 'Sunrise Medicals', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-C-01', product: 'Omeprazole 20mg', quantity: 15, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-12', created_by: 'staff' },
  { id: 'WH/TRANS/001', reference_number: 'WH/TRANS/001', operation_type: 'TRANSFER', status: 'DONE', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-A-01 → Rack-B-01', product: 'Paracetamol 500mg', quantity: 20, direction: 'TRANSFER', reason: 'WAREHOUSE_TRANSFER', operation_date: '2026-09-10', created_by: 'manager' },
  { id: 'WH/TRANS/002', reference_number: 'WH/TRANS/002', operation_type: 'TRANSFER', status: 'DONE', source_or_party: 'Secunderabad Pharmacy', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-B-01 → Rack-C-01', product: 'Cetirizine 10mg', quantity: 30, direction: 'TRANSFER', reason: 'WAREHOUSE_TRANSFER', operation_date: '2026-09-12', created_by: 'admin' },
  { id: 'WH/ADJ/001', reference_number: 'WH/ADJ/001', operation_type: 'ADJUSTMENT', status: 'DONE', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-01', product: 'Paracetamol 500mg', quantity: 5, direction: 'OUT', reason: 'EXPIRED', operation_date: '2026-09-11', created_by: 'manager' },
  { id: 'WH/ADJ/002', reference_number: 'WH/ADJ/002', operation_type: 'ADJUSTMENT', status: 'DONE', source_or_party: 'Secunderabad Pharmacy', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-01', product: 'Cetirizine 10mg', quantity: 3, direction: 'OUT', reason: 'DAMAGED', operation_date: '2026-09-13', created_by: 'admin' },
];

// ─── Store ───────────────────────────────────────────────────────

export const useOperationsStore = create<OperationsState>()((set, get) => ({
  operations: seedData,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all four operation types in parallel
      const [receiptsRes, deliveriesRes, transfersRes, adjustmentsRes] = await Promise.allSettled([
        api.get('/receipts'),
        api.get('/deliveries'),
        api.get('/transfers'),
        api.get('/adjustments'),
      ]);

      const allOps: OperationRecord[] = [];

      if (receiptsRes.status === 'fulfilled') {
        const items = receiptsRes.value.data?.data?.items || receiptsRes.value.data?.items || receiptsRes.value.data || [];
        if (Array.isArray(items)) allOps.push(...items.map(mapReceipt));
      }
      if (deliveriesRes.status === 'fulfilled') {
        const items = deliveriesRes.value.data?.data?.items || deliveriesRes.value.data?.items || deliveriesRes.value.data || [];
        if (Array.isArray(items)) allOps.push(...items.map(mapDelivery));
      }
      if (transfersRes.status === 'fulfilled') {
        const items = transfersRes.value.data?.data?.items || transfersRes.value.data?.items || transfersRes.value.data || [];
        if (Array.isArray(items)) allOps.push(...items.map(mapTransfer));
      }
      if (adjustmentsRes.status === 'fulfilled') {
        const items = adjustmentsRes.value.data?.data?.items || adjustmentsRes.value.data?.items || adjustmentsRes.value.data || [];
        if (Array.isArray(items)) allOps.push(...items.map(mapAdjustment));
      }

      // If we got data from the backend, use it. Otherwise keep seed data.
      if (allOps.length > 0) {
        set({ operations: allOps, isLoading: false });
      } else {
        // Backend has no data yet — keep seed data for demo
        set({ isLoading: false });
      }
    } catch (error: any) {
      console.error('[OperationsStore] Failed to fetch operations:', error.message);
      // On error, keep seed data so the UI still works
      set({ isLoading: false, error: error.message });
    }
  },

  addOperation: (op) =>
    set((state) => {
      let prefix = 'WH/';
      if (op.operation_type === 'RECEIPT') prefix += 'IN/';
      else if (op.operation_type === 'DELIVERY') prefix += 'OUT/';
      else if (op.operation_type === 'TRANSFER') prefix += 'TRANS/';
      else if (op.operation_type === 'ADJUSTMENT') prefix += 'ADJ/';

      const typeOps = state.operations.filter(o => o.operation_type === op.operation_type);
      const nextId = typeOps.length > 0
        ? Math.max(...typeOps.map(o => parseInt(o.reference_number.split('/').pop() || '0'))) + 1
        : 1;

      const reference_number = `${prefix}${String(nextId).padStart(3, '0')}`;
      const id = reference_number;
      return { operations: [...state.operations, { ...op, id, reference_number }] };
    }),

  updateOperation: (id, updates) =>
    set((state) => ({
      operations: state.operations.map((op) => (op.id === id ? { ...op, ...updates } : op)),
    })),

  deleteOperation: (id) =>
    set((state) => ({
      operations: state.operations.filter((op) => op.id !== id),
    })),
}));
