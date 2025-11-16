package com.example.orders.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = true) 
    private Long customerId; 

    @Column(nullable = false, length = 50) 
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private double totalPrice;

    private LocalDateTime orderDate;

    private String paymentTransactionId; // (Null nếu thất bại)
    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

   
    
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}