package com.example.payment.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long orderId; // Mã đơn hàng từ OrderService

    private Double amount; // Số tiền

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String gatewayTransactionId; // Mã giao dịch từ cổng thanh toán

    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}