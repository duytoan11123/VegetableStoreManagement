package com.example.reporting.controller;

import com.example.reporting.dto.BestsellerReportItem;

import com.example.reporting.dto.DashboardOverviewResponse;
import com.example.reporting.dto.DashboardOverviewResponse.DailyRevenueChartItem;
import com.example.reporting.dto.RevenueReportDTO;
import com.example.reporting.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reporting")
public class ReportController {

    @Autowired
    private ReportingService reportingService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardOverviewResponse> getDashboard() {
        DashboardOverviewResponse data = reportingService.getDashboardData();
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportDTO> getRevenueReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(reportingService.getRevenueReport(startDate, endDate));
    }
    
    @GetMapping("/chart")
    public ResponseEntity<List<DailyRevenueChartItem>> getRevenueChart(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(reportingService.getRevenueChart(startDate, endDate));
    }
    
    @GetMapping("/export/monthly")
    public ResponseEntity<byte[]> exportMonthlyReport(
            @RequestParam(value = "month", defaultValue = "0") int month,
            @RequestParam(value = "year", defaultValue = "0") int year
    ) {
        // Mặc định lấy tháng hiện tại nếu không truyền
        if (month == 0 || year == 0) {
            LocalDate now = LocalDate.now();
            month = now.getMonthValue();
            year = now.getYear();
        }

        byte[] csvData = reportingService.exportMonthlyReport(month, year);
        String fileName = String.format("bao_cao_thang_%d_%d.csv", month, year);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}