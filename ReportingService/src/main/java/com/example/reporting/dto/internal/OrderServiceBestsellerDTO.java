package com.example.reporting.dto.internal;

import lombok.Data;

// Giả định OrderService trả về đối tượng này
@Data
public class OrderServiceBestsellerDTO {
    private Long productId;
    private int totalQuantitySold;
}