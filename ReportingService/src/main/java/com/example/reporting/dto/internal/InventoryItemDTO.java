package com.example.reporting.dto.internal;

import lombok.Data;

// Giả định InventoryService trả về đối tượng này
@Data
public class InventoryItemDTO {
	private Long id;

    private String name;    
    private int quantity;   
    private double price;
}