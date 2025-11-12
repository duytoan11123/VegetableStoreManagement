package com.example.orders.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private Double amount;
    private String paymentToken; // Ví dụ: "tok_visa" hoặc "fail_token"
}