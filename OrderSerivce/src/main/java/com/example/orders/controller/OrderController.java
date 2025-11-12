package com.example.orders.controller;

import com.example.orders.dto.CreateOrderRequest;
import com.example.orders.dto.UpdateStatusRequest;
import com.example.orders.model.Order;
import com.example.orders.service.OrderService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Endpoint cho: TạoĐơnHàng()
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order newOrder = orderService.createOrder(request);
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Trả về lỗi rõ ràng
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Endpoint cho: CậpNhậtTrạngTháiĐơn()
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("id") Long orderId, // 👈 Đã chỉ định rõ ràng "id"
            @RequestBody UpdateStatusRequest request) {
        
        Order updatedOrder = orderService.updateOrderStatus(orderId, request.getNewStatus());
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * (Bonus) Endpoint để xem chi tiết đơn hàng
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable("id") Long orderId) { // 👈 Đã chỉ định rõ ràng "id"
        Order order = orderService.getOrderDetails(orderId);
        return ResponseEntity.ok(order);
    }
    
    
}