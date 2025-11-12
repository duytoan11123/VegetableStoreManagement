package com.example.reporting.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RevenueReport {
    private double totalRevenue;
    private LocalDate startDate;
    private LocalDate endDate;
}