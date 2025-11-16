package com.example.payment.controller;

import com.example.payment.dto.PaymentRequest;
import com.example.payment.dto.PaymentResponse;
import com.example.payment.dto.RefundRequest;
import com.example.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Endpoint cho: XửLýThanhToán()
     * POST /api/payments/process
     */
    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        
        if ("FAILED".equals(response.getStatus().toString())) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint cho: HoànTiền()
     * POST /api/payments/refund
     */
    @PostMapping("/refund")
    public ResponseEntity<PaymentResponse> refundPayment(@RequestBody RefundRequest request) {
        PaymentResponse response = paymentService.refundPayment(request);
        return ResponseEntity.ok(response);
    }
}