package com.example.orders.controller;

import com.example.orders.dto.CreateOrderRequest;
import org.springframework.format.annotation.DateTimeFormat;
import com.example.orders.dto.UpdateStatusRequest;
import com.example.orders.model.Order;
import com.example.orders.model.OrderStatus;
import com.example.orders.service.OrderService;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
            // (CẬP NHẬT) Kiểm tra trạng thái cuối cùng
            if (newOrder.getStatus() == OrderStatus.FAILED) {
                // Trả về 400 Bad Request nếu thanh toán thất bại
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Thanh toán thất bại.");
            }
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi máy chủ nội bộ: " + e.getMessage());
        }
    }
    
    
    /**
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("id") Long orderId, 
            @RequestBody UpdateStatusRequest request) {
        
        Order updatedOrder = orderService.updateOrderStatus(orderId, request.getNewStatus());
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(value = "startDate", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            
            @RequestParam(value = "endDate", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            
            @PageableDefault(size = 10, sort = "orderDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(startDate, endDate, pageable));
    }
    
    /**
     * Endpoint để xem chi tiết đơn hàng
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable("id") Long orderId) {
        Order order = orderService.getOrderDetails(orderId);
        return ResponseEntity.ok(order);
    }
    
    
}