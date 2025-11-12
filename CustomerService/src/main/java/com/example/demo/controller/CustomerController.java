package com.example.demo.controller;

import com.example.demo.dto.CreateCustomerRequest;
import com.example.demo.dto.UpdatePointsRequest;
import com.example.demo.model.Customer;
import com.example.demo.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    /**
     * Endpoint cho: ThêmKháchHàng()
     * POST /api/customers
     */
    @PostMapping
    public ResponseEntity<Customer> addCustomer(@RequestBody CreateCustomerRequest request) {
        Customer newCustomer = customerService.addCustomer(request);
        return new ResponseEntity<>(newCustomer, HttpStatus.CREATED);
    }

    /**
     * Endpoint cho: LấyThôngTinKháchHàng()
     * GET /api/customers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerInfo(@PathVariable("id") Long customerId) {
        Customer customer = customerService.getCustomerInfo(customerId);
        return ResponseEntity.ok(customer);
    }

    /**
     * Endpoint cho: CậpNhậtĐiểmTíchLũy()
     * PUT /api/customers/{id}/points
     */
    @PutMapping("/{id}/points")
    public ResponseEntity<Customer> updateLoyaltyPoints(
            @PathVariable("id") Long customerId,
            @RequestBody UpdatePointsRequest request) {
        
        Customer updatedCustomer = customerService.updateLoyaltyPoints(customerId, request.getPointsToAdd());
        return ResponseEntity.ok(updatedCustomer);
    }
}