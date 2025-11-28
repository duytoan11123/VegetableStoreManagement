package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.InventoryResponseDTO;
import com.example.demo.service.InventoryService;

@RestController
@RequestMapping("/api/inventory/metrics")
public class InventoryMetricsController {
	 @Autowired
	 private InventoryService inventoryService;
	 
	@GetMapping("/lowStock")
	public ResponseEntity<Page<InventoryResponseDTO>> getLowStockItem(Pageable pageable){
		return ResponseEntity.ok(inventoryService.getLowStockItem(pageable));
	}
	
	@GetMapping("/totalQuantity")
	public int getTotalQuantity() {
		return inventoryService.getTotalQuantity();
	}
    
}
