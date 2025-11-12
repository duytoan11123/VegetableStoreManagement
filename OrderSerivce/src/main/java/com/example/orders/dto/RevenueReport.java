package com.example.orders.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor // Thêm constructor cho tiện
public class RevenueReport {
    private double totalRevenue;
    private LocalDate startDate;
    private LocalDate endDate;
}