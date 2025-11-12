package com.example.orders.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId; // ID của trái cây từ InventoryService
    private int quantity;
    private double priceAtPurchase; // Lưu lại giá tại thời điểm mua

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore // Tránh lặp vô hạn khi serialize JSON
    private Order order;
}