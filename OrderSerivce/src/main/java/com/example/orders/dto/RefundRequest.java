package com.example.orders.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class RefundRequest {
    private Long orderId;
}