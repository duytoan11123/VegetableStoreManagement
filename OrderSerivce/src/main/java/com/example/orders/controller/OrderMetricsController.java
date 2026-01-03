package com.example.orders.controller;

import com.example.orders.dto.BestsellerDTO;
import com.example.orders.dto.BestsellerProjection;
import com.example.orders.dto.CreateOrderRequest;
import com.example.orders.dto.DailyRevenueDTO;
import com.example.orders.dto.MonthlyRevenueDTO;
import com.example.orders.dto.OrderGrowthDTO;
import com.example.orders.dto.RevenueReport;
import com.example.orders.model.Order;
import com.example.orders.model.OrderStatus;
import com.example.orders.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/orders/metrics") 
public class OrderMetricsController {

    @Autowired
    private OrderService orderService;

    /**
     * Endpoint: GET /api/orders/metrics/revenue-by-date
     */
    @GetMapping("/revenue-by-date")
    public ResponseEntity<RevenueReport> getRevenueReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        RevenueReport report = orderService.generateRevenueReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Endpoint: GET /api/orders/metrics/bestsellers
     */
    @GetMapping("/bestsellers")
    public ResponseEntity<List<BestsellerDTO>> getBestsellers(
            @RequestParam(value="limit",defaultValue = "5") int limit) {
        
        return ResponseEntity.ok(orderService.getBestSellingItems(limit));
    }
    
    /**
     * GET /api/orders/metrics/revenue-chart?days=7
     */
    @GetMapping("/revenue-chart")
    public ResponseEntity<List<DailyRevenueDTO>> getRevenueChart(
            @RequestParam(value = "startDate", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            
            @RequestParam(value = "endDate", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            
            @RequestParam(value = "days", defaultValue = "7") int days
    ) {
        // Truyền tất cả vào Service để nó tự quyết định
        return ResponseEntity.ok(orderService.getRevenueChartData(startDate, endDate, days));
    }
    
    @GetMapping("/growth")
    public ResponseEntity<OrderGrowthDTO> getOrderGrowth() {
        return ResponseEntity.ok(orderService.getOrderGrowthMetric());
    }
    
    @GetMapping("/monthly-revenue")
    public ResponseEntity<MonthlyRevenueDTO> getMonthlyRevenue() {
        return ResponseEntity.ok(orderService.getMonthlyRevenueMetric());
    }
}