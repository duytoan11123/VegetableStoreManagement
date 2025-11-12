package com.example.orders.dto;

// Đây là một "Projection" (hình chiếu)
// Spring Data sẽ tự động điền dữ liệu từ query vào interface này
public interface BestsellerProjection {
    Long getProductId();
    Integer getTotalQuantitySold(); // Dùng Integer/Long thay vì int cho an toàn
}