package com.example.demo.dto;

import lombok.Data;

@Data
public class ImportRecordRequest {
    private String importDate; // ISO string, optional
    private String items;
    private Double totalAmount;
}
