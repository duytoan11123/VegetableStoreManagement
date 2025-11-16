package com.example.payment.service;

import com.example.payment.dto.PaymentRequest;
import com.example.payment.dto.PaymentResponse;
import com.example.payment.dto.RefundRequest;
import com.example.payment.model.PaymentStatus;
import com.example.payment.model.PaymentTransaction;
import com.example.payment.repository.PaymentTransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentTransactionRepository transactionRepository;

    /**
     * 1. Logic cho: XửLýThanhToán()
     */
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        PaymentResponse response = new PaymentResponse();
        
        // Mô phỏng: Nếu là "CARD" và số tiền > 500,000 thì thất bại
        if ("CARD".equals(request.getPaymentMethod()) && request.getTotalPrice() > 1000000) {
        	System.err.print(request.getTotalPrice());
            response.setStatus(PaymentStatus.FAILED);
            response.setMessage("Thanh toán thẻ thất bại, vượt quá hạn mức.");
            response.setTransactionId(null);
        } else {
            // Thanh toán thành công (hoặc là "CASH")
            response.setStatus(PaymentStatus.SUCCESS);
            response.setMessage("Thanh toán thành công.");
            response.setTransactionId(UUID.randomUUID().toString());
        }
        
        

        return response;
    }

    /**
     * 2. Logic cho: HoànTiền()
     */
    @Transactional
    public PaymentResponse refundPayment(RefundRequest request) {
        
        // 1. Tìm giao dịch SUCCESS trước đó của đơn hàng
        PaymentTransaction transaction = transactionRepository
                .findByOrderIdAndStatus(request.getOrderId(), PaymentStatus.SUCCESS)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giao dịch thành công cho đơn hàng: " + request.getOrderId()));

        transaction.setStatus(PaymentStatus.REFUNDED);
        transactionRepository.save(transaction);

        return new PaymentResponse(transaction.getGatewayTransactionId(), PaymentStatus.REFUNDED, "Hoàn tiền thành công");
    }
}