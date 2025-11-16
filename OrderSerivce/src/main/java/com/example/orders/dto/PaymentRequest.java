package com.example.orders.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private double totalPrice;
    private String paymentMethod; // "CASH" hoặc "CARD"
    private String cardDetails; // (Giả định, có thể là token của Stripe, v.v.)
}