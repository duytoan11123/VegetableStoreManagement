package com.example.demo.controller;

import com.example.demo.dto.CustomerRequestDTO;
import com.example.demo.dto.CustomerResponseDTO;
import com.example.demo.dto.LoyaltyPointsUpdateDTO;
import com.example.demo.model.Customer.CustomerStatus;
import com.example.demo.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerRequestDTO requestDTO) {
        CustomerResponseDTO responseDTO = customerService.createCustomer(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // ✅ PHẢI ĐẶT /search TRƯỚC /{id}
    @GetMapping("/search")
    public ResponseEntity<Page<CustomerResponseDTO>> searchCustomers(
            @RequestParam(name = "keyword") String keyword,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        CustomerStatus customerStatus = status != null ? CustomerStatus.valueOf(status.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerResponseDTO> customers = customerService.searchCustomers(keyword, customerStatus, pageable);
        return ResponseEntity.ok(customers);
    }

    // ✅ ĐẶT /{id} SAU /search
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> getCustomerById(@PathVariable Long id) {
        CustomerResponseDTO responseDTO = customerService.getCustomerById(id);
        return ResponseEntity.ok(responseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequestDTO requestDTO) {
        CustomerResponseDTO responseDTO = customerService.updateCustomer(id, requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().body(new MessageResponse("Customer deleted successfully"));
    }

    @PatchMapping("/{id}/loyalty-points")
    public ResponseEntity<CustomerResponseDTO> updateLoyaltyPoints(
            @PathVariable Long id,
            @Valid @RequestBody LoyaltyPointsUpdateDTO updateDTO) {
        CustomerResponseDTO responseDTO = customerService.updateLoyaltyPoints(id, updateDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping
    public ResponseEntity<Page<CustomerResponseDTO>> getAllCustomers(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        CustomerStatus customerStatus = status != null ? CustomerStatus.valueOf(status.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerResponseDTO> customers = customerService.getAllCustomers(customerStatus, pageable);
        return ResponseEntity.ok(customers);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e) {
        ErrorResponse error = new ErrorResponse("Error", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Inner classes for responses
    private static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    private static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}