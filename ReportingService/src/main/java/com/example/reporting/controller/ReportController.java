package com.example.reporting.controller;

import com.example.reporting.dto.BestsellerReportItem;
import com.example.reporting.dto.RevenueReport;
import com.example.reporting.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportingService reportingService;

    /**
     * Endpoint cho: TạoBáoCáoDoanhThu()
     * Ví dụ: GET /api/reports/revenue?startDate=2025-01-01&endDate=2025-01-31
     */
    @GetMapping("/revenue")
    public ResponseEntity<RevenueReport> getRevenueReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        RevenueReport report = reportingService.generateRevenueReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Endpoint cho: LấyDanhSáchHàngBánChạy()
     * Ví dụ: GET /api/reports/bestsellers?limit=5
     */
    @GetMapping("/bestsellers")
    public ResponseEntity<List<BestsellerReportItem>> getBestSellers(
            @RequestParam(defaultValue = "5") int limit) {
        
        List<BestsellerReportItem> report = reportingService.getBestSellingItems(limit);
        return ResponseEntity.ok(report);
    }
}