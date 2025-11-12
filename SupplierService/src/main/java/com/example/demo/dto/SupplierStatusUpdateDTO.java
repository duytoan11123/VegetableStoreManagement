package com.example.demo.dto;

import com.example.demo.model.Supplier.SupplierStatus;
import jakarta.validation.constraints.NotNull;

public class SupplierStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private SupplierStatus status;

    private String reason;

    // Constructors
    public SupplierStatusUpdateDTO() {
    }

    // Getters and Setters
    public SupplierStatus getStatus() {
        return status;
    }

    public void setStatus(SupplierStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

