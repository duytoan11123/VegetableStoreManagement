package com.example.demo.dto;


import lombok.Data;

@Data
public class InventoryResponseDTO {
	private Long id;
	private String name;
	private int quantity;
	private double price;
	private Long supplierId;
	private String status;
	private String categoryName;
}
