// --- Kiểu Dữ liệu Chung cho Kho hàng ---

/**
 * Định nghĩa cấu trúc của một Nhà cung cấp (Supplier)
 */
export interface Supplier {
    id: number;
    name: string;
}

/**
 * Định nghĩa cấu trúc của một Danh mục (Category)
 */
export interface Category {
    id: number;
    name: string;
}

/**
 * Định nghĩa cấu trúc của một Sản phẩm Tồn kho (InventoryItem)
 * Đây là DTO (đã có categoryName) mà Frontend nhận được từ Backend.
 */
export interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    supplierId: number; 
    status: string;       
    categoryName: string; 
}

/**
 * Định nghĩa cấu trúc của đối tượng Phân trang (Page)
 * mà Spring Boot Backend trả về.
 */
export interface InventoryPageData {
  content: InventoryItem[]; // Mảng chứa dữ liệu của trang hiện tại
  totalPages: number;     // Tổng số trang
  totalElements: number;  // Tổng số phần tử
  number: number;         // Số trang hiện tại (bắt đầu từ 0)
  size: number;           // Kích thước trang
  first: boolean;         // Là trang đầu tiên?
  last: boolean;          // Là trang cuối cùng?
}

export interface CreateItemData {
    name: string;
    quantity: number | string;
    price: number | string;
    supplierId: number | string;
    categoryId: number | string;
}

// Định nghĩa Props cho Modal
export interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessRefresh: () => void; // Hàm để gọi lại (refresh) bảng dữ liệu
    suppliers: Supplier[]; // Nhận danh sách suppliers từ trang cha
    categories: Category[]; // Nhận danh sách categories từ trang cha
    itemToEdit: InventoryItem | null;
}


export interface FormData {
    name: string;
    quantity: number | string; 
    price: number | string;
    supplierId: number | string;
    categoryId: number | string;
}