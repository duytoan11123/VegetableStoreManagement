package com.example.payment.repository;

import com.example.payment.model.PaymentTransaction;
import com.example.payment.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    // Tìm giao dịch thành công theo mã đơn hàng
    Optional<PaymentTransaction> findByOrderIdAndStatus(Long orderId, PaymentStatus status);
}