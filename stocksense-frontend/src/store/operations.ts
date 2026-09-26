import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OperationType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';
export type OperationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface OperationRecord {
  id: string; // Internal ID
  reference_number: string; // WH/IN/001 etc
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
  addOperation: (op: Omit<OperationRecord, 'id' | 'reference_number'>) => void;
  updateOperation: (id: string, updates: Partial<OperationRecord>) => void;
  deleteOperation: (id: string) => void;
}

const initialData: OperationRecord[] = [
  { id: 'WH/IN/001', reference_number: 'WH/IN/001', operation_type: 'RECEIPT', status: 'COMPLETED', source_or_party: 'Medico Distributors', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-01', product: 'Paracetamol 500mg', quantity: 100, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-01', created_by: 'admin' },
  { id: 'WH/IN/002', reference_number: 'WH/IN/002', operation_type: 'RECEIPT', status: 'COMPLETED', source_or_party: 'Apollo Pharma Supply', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-02', product: 'Amoxicillin 500mg', quantity: 80, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-02', created_by: 'manager' },
  { id: 'WH/IN/003', reference_number: 'WH/IN/003', operation_type: 'RECEIPT', status: 'COMPLETED', source_or_party: 'HealthPlus Distributors', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-01', product: 'Cetirizine 10mg', quantity: 120, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-03', created_by: 'staff' },
  { id: 'WH/IN/004', reference_number: 'WH/IN/004', operation_type: 'RECEIPT', status: 'APPROVED', source_or_party: 'MediSource India', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-03', product: 'Azithromycin 500mg', quantity: 60, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-05', created_by: 'manager' },
  { id: 'WH/IN/005', reference_number: 'WH/IN/005', operation_type: 'RECEIPT', status: 'PENDING', source_or_party: 'CareMed Suppliers', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-02', product: 'Ibuprofen 400mg', quantity: 90, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-07', created_by: 'staff' },
  { id: 'WH/IN/006', reference_number: 'WH/IN/006', operation_type: 'RECEIPT', status: 'COMPLETED', source_or_party: 'LifeLine Pharma', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-C-01', product: 'Omeprazole 20mg', quantity: 75, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-09', created_by: 'admin' },
  { id: 'WH/IN/007', reference_number: 'WH/IN/007', operation_type: 'RECEIPT', status: 'COMPLETED', source_or_party: 'Medico Distributors', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-C-02', product: 'Metformin 500mg', quantity: 110, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-10', created_by: 'manager' },
  { id: 'WH/IN/008', reference_number: 'WH/IN/008', operation_type: 'RECEIPT', status: 'CANCELLED', source_or_party: 'HealthPlus Distributors', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-C-03', product: 'ORS Sachet', quantity: 50, direction: 'IN', reason: 'PURCHASE', operation_date: '2026-09-11', created_by: 'staff' },
  
  { id: 'WH/OUT/001', reference_number: 'WH/OUT/001', operation_type: 'DELIVERY', status: 'COMPLETED', source_or_party: 'ABC Clinic', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-01', product: 'Paracetamol 500mg', quantity: 30, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-04', created_by: 'staff' },
  { id: 'WH/OUT/002', reference_number: 'WH/OUT/002', operation_type: 'DELIVERY', status: 'COMPLETED', source_or_party: 'CityCare Hospital', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-02', product: 'Amoxicillin 500mg', quantity: 20, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-06', created_by: 'manager' },
  { id: 'WH/OUT/003', reference_number: 'WH/OUT/003', operation_type: 'DELIVERY', status: 'APPROVED', source_or_party: 'GreenCross Clinic', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-01', product: 'Cetirizine 10mg', quantity: 25, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-08', created_by: 'manager' },
  { id: 'WH/OUT/004', reference_number: 'WH/OUT/004', operation_type: 'DELIVERY', status: 'PENDING', source_or_party: 'Sunrise Medicals', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-C-01', product: 'Omeprazole 20mg', quantity: 15, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-12', created_by: 'staff' },
  { id: 'WH/OUT/005', reference_number: 'WH/OUT/005', operation_type: 'DELIVERY', status: 'COMPLETED', source_or_party: 'WellCare Hospital', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-C-02', product: 'Metformin 500mg', quantity: 40, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-13', created_by: 'admin' },
  { id: 'WH/OUT/006', reference_number: 'WH/OUT/006', operation_type: 'DELIVERY', status: 'CANCELLED', source_or_party: 'Prime Clinic', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-02', product: 'Ibuprofen 400mg', quantity: 10, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-14', created_by: 'staff' },
  { id: 'WH/OUT/007', reference_number: 'WH/OUT/007', operation_type: 'DELIVERY', status: 'COMPLETED', source_or_party: 'Apollo Care Center', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-03', product: 'Azithromycin 500mg', quantity: 12, direction: 'OUT', reason: 'SALE', operation_date: '2026-09-15', created_by: 'manager' },

  { id: 'WH/TRANS/001', reference_number: 'WH/TRANS/001', operation_type: 'TRANSFER', status: 'COMPLETED', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-A-01 → Rack-B-01', product: 'Paracetamol 500mg', quantity: 20, direction: 'TRANSFER', reason: 'WAREHOUSE_TRANSFER', operation_date: '2026-09-10', created_by: 'manager' },
  { id: 'WH/TRANS/002', reference_number: 'WH/TRANS/002', operation_type: 'TRANSFER', status: 'COMPLETED', source_or_party: 'Secunderabad Pharmacy', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-B-01 → Rack-C-01', product: 'Cetirizine 10mg', quantity: 30, direction: 'TRANSFER', reason: 'WAREHOUSE_TRANSFER', operation_date: '2026-09-12', created_by: 'admin' },
  { id: 'WH/TRANS/003', reference_number: 'WH/TRANS/003', operation_type: 'TRANSFER', status: 'APPROVED', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-A-02 → Rack-C-02', product: 'Amoxicillin 500mg', quantity: 15, direction: 'TRANSFER', reason: 'WAREHOUSE_TRANSFER', operation_date: '2026-09-16', created_by: 'manager' },
  { id: 'WH/TRANS/004', reference_number: 'WH/TRANS/004', operation_type: 'TRANSFER', status: 'PENDING', source_or_party: 'Banjara Pharmacy', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-C-02 → Rack-A-02', product: 'Metformin 500mg', quantity: 25, direction: 'TRANSFER', reason: 'RESTOCK', operation_date: '2026-09-17', created_by: 'staff' },
  { id: 'WH/TRANS/005', reference_number: 'WH/TRANS/005', operation_type: 'TRANSFER', status: 'CANCELLED', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-C-01 → Rack-B-02', product: 'Omeprazole 20mg', quantity: 10, direction: 'TRANSFER', reason: 'WAREHOUSE_TRANSFER', operation_date: '2026-09-18', created_by: 'staff' },
  { id: 'WH/TRANS/006', reference_number: 'WH/TRANS/006', operation_type: 'TRANSFER', status: 'COMPLETED', source_or_party: 'Secunderabad Pharmacy', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-B-02 → Rack-A-03', product: 'Ibuprofen 400mg', quantity: 20, direction: 'TRANSFER', reason: 'RESTOCK', operation_date: '2026-09-19', created_by: 'admin' },

  { id: 'WH/ADJ/001', reference_number: 'WH/ADJ/001', operation_type: 'ADJUSTMENT', status: 'COMPLETED', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-01', product: 'Paracetamol 500mg', quantity: 5, direction: 'OUT', reason: 'EXPIRED', operation_date: '2026-09-11', created_by: 'manager' },
  { id: 'WH/ADJ/002', reference_number: 'WH/ADJ/002', operation_type: 'ADJUSTMENT', status: 'COMPLETED', source_or_party: 'Secunderabad Pharmacy', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-01', product: 'Cetirizine 10mg', quantity: 3, direction: 'OUT', reason: 'DAMAGED', operation_date: '2026-09-13', created_by: 'admin' },
  { id: 'WH/ADJ/003', reference_number: 'WH/ADJ/003', operation_type: 'ADJUSTMENT', status: 'APPROVED', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-02', product: 'Amoxicillin 500mg', quantity: 4, direction: 'IN', reason: 'COUNT_CORRECTION', operation_date: '2026-09-16', created_by: 'manager' },
  { id: 'WH/ADJ/004', reference_number: 'WH/ADJ/004', operation_type: 'ADJUSTMENT', status: 'PENDING', source_or_party: 'Banjara Pharmacy', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-C-03', product: 'ORS Sachet', quantity: 8, direction: 'OUT', reason: 'EXPIRED', operation_date: '2026-09-20', created_by: 'staff' },
  { id: 'WH/ADJ/005', reference_number: 'WH/ADJ/005', operation_type: 'ADJUSTMENT', status: 'COMPLETED', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-C-01', product: 'Omeprazole 20mg', quantity: 2, direction: 'OUT', reason: 'DAMAGED', operation_date: '2026-09-21', created_by: 'admin' },
  { id: 'WH/ADJ/006', reference_number: 'WH/ADJ/006', operation_type: 'ADJUSTMENT', status: 'COMPLETED', source_or_party: 'Banjara Pharmacy', destination_or_warehouse: 'Banjara Pharmacy', location: 'Rack-C-02', product: 'Metformin 500mg', quantity: 6, direction: 'IN', reason: 'COUNT_CORRECTION', operation_date: '2026-09-22', created_by: 'manager' },
  { id: 'WH/ADJ/007', reference_number: 'WH/ADJ/007', operation_type: 'ADJUSTMENT', status: 'CANCELLED', source_or_party: 'Secunderabad Pharmacy', destination_or_warehouse: 'Secunderabad Pharmacy', location: 'Rack-B-02', product: 'Ibuprofen 400mg', quantity: 5, direction: 'OUT', reason: 'LOSS', operation_date: '2026-09-23', created_by: 'staff' },
  { id: 'WH/ADJ/008', reference_number: 'WH/ADJ/008', operation_type: 'ADJUSTMENT', status: 'COMPLETED', source_or_party: 'Hyderabad Pharmacy', destination_or_warehouse: 'Hyderabad Pharmacy', location: 'Rack-A-03', product: 'Azithromycin 500mg', quantity: 2, direction: 'OUT', reason: 'EXPIRED', operation_date: '2026-09-24', created_by: 'admin' }
];

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set) => ({
      operations: initialData,
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
    }),
    {
      name: 'operations-storage',
    }
  )
);
