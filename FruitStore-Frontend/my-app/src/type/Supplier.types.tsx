// --- Kiểu Dữ liệu Chung cho Nhà cung cấp ---

/**
 * Định nghĩa cấu trúc của một Nhà cung cấp (Supplier)
 * (Giả định dựa trên API Backend)
 */
export interface Supplier {
    id: number;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
}

/**
 * Định nghĩa cấu trúc của đối tượng Phân trang (Page)
 * mà Spring Boot Backend (SupplierService) trả về.
 */
export interface SupplierPageData {
  content: Supplier[]; // Mảng chứa dữ liệu của trang hiện tại
  totalPages: number;     // Tổng số trang
  totalElements: number;  // Tổng số phần tử
  number: number;         // Số trang hiện tại (bắt đầu từ 0)
  size: number;           // Kích thước trang
  first: boolean;         // Là trang đầu tiên?
  last: boolean;          // Là trang cuối cùng?
}

export interface ImportItemDTO {
    itemId: number;
    quantityToAdd: number;
}

export interface ImportGoodsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessRefresh: () => void; 
    supplierId: number | null;
    supplierName: string | null;
}

export type ImportFormState = Record<string, number | string>;