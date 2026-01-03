export interface ImportRecord {
  id: number;
  supplierId: number;
  importDate: string; // ISO string
  items?: string; // text or JSON string describing items
  totalAmount?: number;
}
