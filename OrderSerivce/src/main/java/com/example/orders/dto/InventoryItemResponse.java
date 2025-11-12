package com.example.orders.dto;

import lombok.Data;

@Data
public class InventoryItemResponse {
    // Phải khớp với các trường của InventoryItem.java
    private Long id;
    private String name;
    private int quantity;
    private double price;
}