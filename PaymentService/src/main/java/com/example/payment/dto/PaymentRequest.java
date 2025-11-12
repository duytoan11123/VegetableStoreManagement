package com.example.payment.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private Double amount;
    private String paymentToken; // Thông tin thẻ/ví (ví dụ: "tok_visa" từ Stripe)
}