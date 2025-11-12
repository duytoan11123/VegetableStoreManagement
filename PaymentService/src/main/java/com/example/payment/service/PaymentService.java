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
        // 1. Tạo giao dịch ở trạng thái PENDING
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrderId(request.getOrderId());
        transaction.setAmount(request.getAmount());
        transaction.setStatus(PaymentStatus.PENDING);
        transaction = transactionRepository.save(transaction);

        try {
            // 2. MÔ PHỎNG GỌI CỔNG THANH TOÁN (Stripe, PayPal...)
            // (Trong thực tế, bạn sẽ gọi API của bên thứ 3 ở đây)
            
            // Logic giả lập: Nếu token là "fail" thì cho thanh toán thất bại
            if ("fail_token".equals(request.getPaymentToken())) {
                throw new RuntimeException("Thanh toán bị từ chối bởi ngân hàng.");
            }
            
            // Giả lập thành công, nhận về mã giao dịch
            String gatewayId = "txn_" + UUID.randomUUID().toString().substring(0, 10);
            
            // 3. Cập nhật giao dịch thành SUCCESS
            transaction.setStatus(PaymentStatus.SUCCESS);
            transaction.setGatewayTransactionId(gatewayId);
            transactionRepository.save(transaction);
            
            return new PaymentResponse(gatewayId, PaymentStatus.SUCCESS, "Thanh toán thành công");

        } catch (Exception e) {
            // 4. Cập nhật giao dịch thành FAILED nếu có lỗi
            transaction.setStatus(PaymentStatus.FAILED);
            transactionRepository.save(transaction);
            
            // Ném lỗi để OrderService biết và rollback
            throw new RuntimeException("Xử lý thanh toán thất bại: " + e.getMessage());
        }
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

        // 2. MÔ PHỎNG GỌI API HOÀN TIỀN CỦA CỔNG THANH TOÁN
        // (Trong thực tế, bạn sẽ gọi API refund của Stripe/PayPal...)
        // String refundId = stripe.refunds().create(transaction.getGatewayTransactionId());

        // 3. Cập nhật trạng thái
        transaction.setStatus(PaymentStatus.REFUNDED);
        transactionRepository.save(transaction);

        return new PaymentResponse(transaction.getGatewayTransactionId(), PaymentStatus.REFUNDED, "Hoàn tiền thành công");
    }
}