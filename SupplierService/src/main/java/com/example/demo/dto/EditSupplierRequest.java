package com.example.demo.dto;

import lombok.Data;

@Data
public class EditSupplierRequest {
	private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String description;
}

