package com.example.orders.dto;

import lombok.Data;

// Dùng để hứng response (chỉ cần lấy status)
@Data
public class PaymentResponse {
    private String transactionId;
    private String status; // SUCCESS, FAILED, REFUNDED
}