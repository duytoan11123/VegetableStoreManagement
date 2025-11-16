package com.example.demo.controller;

import com.example.demo.model.Customer;
import com.example.demo.dto.CustomerRequestDTO;
import com.example.demo.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(
            @RequestParam(value = "search", required = false) String search
    ) {
        List<Customer> customers = customerService.getAllCustomers(search);
        return ResponseEntity.ok(customers);
    }
    
    @PostMapping
    public ResponseEntity<Customer> addCustomer(@RequestBody CustomerRequestDTO request) {
        Customer newCustomer = customerService.addCustomer(request);
        return new ResponseEntity<>(newCustomer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable("id") Long id, 
            @RequestBody CustomerRequestDTO request) 
    {
        Customer updatedCustomer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable("id") Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }
}