package com.example.demo.controller;

import com.example.demo.dto.CreateSupplierRequest;
import com.example.demo.dto.EditSupplierRequest;
import com.example.demo.dto.ImportHistoryRequest;
import com.example.demo.model.ImportHistory;
import com.example.demo.model.Supplier;
import com.example.demo.repository.ImportHistoryRepository;
import com.example.demo.service.SupplierService;


import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;


    // 👇 1. KHAI BÁO INVENTORY SERVICE


    @Autowired
    private ImportHistoryRepository importHistoryRepository; 
    /**
     * Endpoint cho: ThêmNhàCungCấp()
     * POST /api/suppliers
     */

    @PostMapping
    public ResponseEntity<Supplier> addSupplier(@RequestBody CreateSupplierRequest request) {
        Supplier newSupplier = supplierService.addSupplier(request);
        return new ResponseEntity<>(newSupplier, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierInfo(@PathVariable("id") Long supplierId) {
        Supplier supplier = supplierService.getSupplierInfo(supplierId);
        return ResponseEntity.ok(supplier);
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<ImportHistory>> getImportHistory(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Instant start = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();

        Instant end = endDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();
        return ResponseEntity.ok(importHistoryRepository.findByImportDateBetween(start, end));
    }
    
    @PutMapping("{id}")

    public ResponseEntity<Supplier> editSupplier(@PathVariable(value = "id") Long id, @RequestBody EditSupplierRequest request){
        Supplier editedSupplier = supplierService.updateSupplier(id, request);
        return new ResponseEntity<>(editedSupplier, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable(value="id") Long id){
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers(
            @RequestParam(value = "search", required = false) String search
    ) {
        List<Supplier> suppliers = supplierService.getAllSuppliers(search);
        return ResponseEntity.ok(suppliers);
    }


    @PostMapping("/history/batch")
    public ResponseEntity<Void> saveImportHistoryBatch(@RequestBody List<ImportHistoryRequest> requests) {
        supplierService.saveImportHistoryBatch(requests);
        return ResponseEntity.ok().build();
    }

}