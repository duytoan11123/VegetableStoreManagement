package com.example.demo.dto;

import lombok.Data;

@Data
public class UpdateStockRequest {
    // Số lượng tồn kho mới
    private int newQuantity;

}