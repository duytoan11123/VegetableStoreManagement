	package com.example.demo.controller;

import com.example.demo.dto.SupplierRequestDTO;
import com.example.demo.dto.SupplierResponseDTO;
import com.example.demo.dto.SupplierStatusUpdateDTO;
import com.example.demo.model.Supplier.SupplierStatus;
import com.example.demo.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierResponseDTO> createSupplier(@Valid @RequestBody SupplierRequestDTO requestDTO) {
        SupplierResponseDTO responseDTO = supplierService.createSupplier(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> getSupplierById(@PathVariable Long id) {
        SupplierResponseDTO responseDTO = supplierService.getSupplierById(id);
        return ResponseEntity.ok(responseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequestDTO requestDTO) {
        SupplierResponseDTO responseDTO = supplierService.updateSupplier(id, requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok().body(new MessageResponse("Supplier deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SupplierResponseDTO> updateSupplierStatus(
            @PathVariable Long id,
            @Valid @RequestBody SupplierStatusUpdateDTO updateDTO) {
        SupplierResponseDTO responseDTO = supplierService.updateSupplierStatus(id, updateDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping
    public ResponseEntity<Page<SupplierResponseDTO>> getAllSuppliers(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        SupplierStatus supplierStatus = status != null ? SupplierStatus.valueOf(status.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size);
        Page<SupplierResponseDTO> suppliers = supplierService.getAllSuppliers(supplierStatus, pageable);
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<SupplierResponseDTO>> searchSuppliers(
            @RequestParam(name = "keyword") String keyword,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        SupplierStatus supplierStatus = status != null ? SupplierStatus.valueOf(status.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size);
        Page<SupplierResponseDTO> suppliers = supplierService.searchSuppliers(keyword, supplierStatus, pageable);
        return ResponseEntity.ok(suppliers);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e) {
        ErrorResponse error = new ErrorResponse("Error", e.getMessage());
        HttpStatus status = e.getMessage().contains("not found") ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(error);
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

