package com.example.orders.controller;

import com.example.orders.dto.CreateOrderRequest;
import com.example.orders.dto.UpdateStatusRequest;
import com.example.orders.model.Order;
import com.example.orders.model.OrderStatus;
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
     * Endpoint cho: CậpNhậtTrạngTháiĐơn()
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("id") Long orderId, 
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