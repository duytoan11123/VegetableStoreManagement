package com.example.demo.dto;

import lombok.Data;

@Data
public class CreateItemRequest {
    private String name;
    private int quantity;
	private double price;
	private Long supplierId;
	
}