package com.example.payment.dto;

import com.example.payment.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResponse {
    private String transactionId;
    private PaymentStatus status;
    private String message;
}