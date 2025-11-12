package com.example.orders.dto;

import lombok.Data;

@Data
public class UpdateStockRequest {
    private int newQuantity;
}