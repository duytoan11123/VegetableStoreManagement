package com.example.orders.dto;

import java.time.LocalDate;

public interface DailyRevenueProjection {
    LocalDate getDate();
    Double getRevenue();
}