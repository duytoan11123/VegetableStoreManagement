package com.example.orders.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest{
    private Long customerId;
    private String paymentMethod;
    private double totalPrice;
    private List<OrderItemRequest> items;


}