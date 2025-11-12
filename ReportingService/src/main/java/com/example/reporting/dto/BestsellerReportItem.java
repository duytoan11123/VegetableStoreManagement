package com.example.reporting.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class BestsellerReportItem {
    private Long productId;
    private String productName;
    private int totalQuantitySold;
}