package com.example.orders.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
	private Long productId;
    private String productName;
    private int quantity;
    private double pricePerUnit;
}