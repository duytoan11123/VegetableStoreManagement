package com.example.reporting.controller;

import com.example.reporting.dto.BestsellerReportItem;
import com.example.reporting.dto.DashboardOverviewResponse;
import com.example.reporting.dto.RevenueReport;
import com.example.reporting.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
}