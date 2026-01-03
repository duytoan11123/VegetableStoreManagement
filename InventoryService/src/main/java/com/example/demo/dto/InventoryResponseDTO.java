package com.example.demo.dto;
import java.time.LocalDateTime;

import lombok.Data;
import java.time.Instant;

@Data
public class InventoryResponseDTO {
	private Long id;
	private String name;
	private int quantity;
	private double price;
	private Long supplierId;
	private String status;
	private String categoryName;
    private Instant importDate;
    private LocalDateTime addedDate;

}
