import { InventoryItem } from "./Inventory.types";


export interface CartItem extends InventoryItem {
    cartQuantity: number  | string; // Cho phép rỗng khi người dùng xoá input
}


export interface CreateOrderRequestDTO {
    customerId: number | null;
    paymentMethod: string;
    totalPrice: number;
    items: {
        productId: number;
        productName: string;
        quantity: number;
        pricePerUnit: number;
    }[];
}

export interface OrderItemResponse {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    pricePerUnit: number; 
}

export interface OrderResponse {
    id: number;
    customerId: number | null;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentMethod: string;
    totalPrice: number;
    orderDate: string; // ISO Date string
    items: OrderItemResponse[];
}

export interface OrderPageData {
    content: OrderResponse[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}