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