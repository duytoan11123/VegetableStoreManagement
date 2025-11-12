package com.example.orders.model;

public enum OrderStatus {
    PENDING,     // Đang chờ xử lý
    PROCESSING,  // Đang xử lý
    SHIPPED,     // Đã giao hàng
    DELIVERED,   // Đã nhận
    CANCELLED,    // Đã hủy
    FAILED
}