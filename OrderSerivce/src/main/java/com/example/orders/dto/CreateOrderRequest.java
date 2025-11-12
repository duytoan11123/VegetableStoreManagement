package com.example.orders.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    // private Long customerId; (Bạn có thể thêm ID khách hàng ở đây)
    private List<OrderItemRequest> items;
    private String paymentToken;
    private Long customerId;
}