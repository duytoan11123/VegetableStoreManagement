package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;


@Data
public class ImportHistoryRequest {
    
    private Long supplierId;      
    
    private Long itemId;          
    
    private String itemName;      
    
    private int quantityAdded;    
    
    private double pricePerUnit;  
    
    private LocalDateTime importDate; 
}