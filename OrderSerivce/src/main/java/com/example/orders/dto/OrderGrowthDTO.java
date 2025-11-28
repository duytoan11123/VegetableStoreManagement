package com.example.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderGrowthDTO {
    private long todayOrders;    
    private double growthRate;   
}