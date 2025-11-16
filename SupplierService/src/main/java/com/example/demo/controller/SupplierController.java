package com.example.demo.controller;

import com.example.demo.dto.CreateSupplierRequest;
import com.example.demo.model.Supplier;
import com.example.demo.service.SupplierService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    /**
     * Endpoint cho: ThêmNhàCungCấp()
     * POST /api/suppliers
     */
    @PostMapping
    public ResponseEntity<Supplier> addSupplier(@RequestBody CreateSupplierRequest request) {
        Supplier newSupplier = supplierService.addSupplier(request);
        return new ResponseEntity<>(newSupplier, HttpStatus.CREATED);
    }

    /**
     * Endpoint cho: LấyThôngTinNhàCungCấp()
     * GET /api/suppliers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierInfo(@PathVariable("id") Long supplierId) {
        Supplier supplier = supplierService.getSupplierInfo(supplierId);
        return ResponseEntity.ok(supplier);
    }
    

    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers(
            @RequestParam(value = "search", required = false) String search
    ) {
        List<Supplier> suppliers = supplierService.getAllSuppliers(search);
        return ResponseEntity.ok(suppliers);
    }
}