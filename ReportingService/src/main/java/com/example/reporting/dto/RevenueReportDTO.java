package com.example.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueReportDTO {
    private Double totalRevenue;
    private LocalDate startDate;
    private LocalDate endDate;
}