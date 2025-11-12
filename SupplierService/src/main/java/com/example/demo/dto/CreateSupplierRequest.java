package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateSupplierRequest {
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
}