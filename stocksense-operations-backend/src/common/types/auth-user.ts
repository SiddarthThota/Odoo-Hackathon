export type UserRole = 'InventoryManager' | 'WarehouseStaff';

export interface AuthUser {
  sub: string;
  role: UserRole;
  email?: string;
}
