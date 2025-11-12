package com.example.payment.dto;

import lombok.Data;

@Data
public class RefundRequest {
    private Long orderId; // Dùng OrderId để yêu cầu hoàn tiền
}