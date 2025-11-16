package com.example.orders.model;

public enum OrderStatus {
    PENDING,        // Mới tạo, đang chờ thanh toán
    PAID,           // Đã thanh toán (thành công)
    FAILED, // Thanh toán thất bại
    SHIPPED,        // Đang giao
    DELIVERED,      // Đã giao
    CANCELLED       // Đã hủy
}