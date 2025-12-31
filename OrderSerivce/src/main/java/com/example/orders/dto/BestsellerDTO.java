package com.example.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BestsellerDTO {
    private Long productId;
    private String productName;
    private Long totalQuantity;
}