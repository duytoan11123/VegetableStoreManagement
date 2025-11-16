package com.example.orders.controller;

import com.example.orders.dto.BestsellerProjection;
import com.example.orders.dto.CreateOrderRequest;
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
@RequestMapping("/api/orders/reports") 
public class OrderReportController {

    @Autowired
    private OrderService orderService;

    /**
     * Endpoint: GET /api/orders/reports/revenue-by-date
     */
    @GetMapping("/revenue-by-date")
    public ResponseEntity<RevenueReport> getRevenueReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        RevenueReport report = orderService.generateRevenueReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Endpoint: GET /api/orders/reports/bestsellers
     */
    @GetMapping("/bestsellers")
    public ResponseEntity<List<BestsellerProjection>> getBestSellers(
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        
        List<BestsellerProjection> report = orderService.getBestSellingItems(limit);
        return ResponseEntity.ok(report);
    }
    
    
}