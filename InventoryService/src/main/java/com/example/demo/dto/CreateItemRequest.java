package com.example.demo.dto;

import com.example.demo.model.STATUS;

import lombok.Data;

@Data
public class CreateItemRequest {
    private String name;
    private int quantity;
	private double price;
	private Long supplierId;
	private Long categoryId;
	private STATUS status;
}