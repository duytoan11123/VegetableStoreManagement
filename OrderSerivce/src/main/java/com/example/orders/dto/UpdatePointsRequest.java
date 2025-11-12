package com.example.orders.dto;

import lombok.Data;

// DTO này dùng để GỬI request đến CustomerService
@Data
public class UpdatePointsRequest {
    private int pointsToAdd;
}