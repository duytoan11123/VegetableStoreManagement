package com.example.demo.controller;

import com.example.demo.dto.CreateItemRequest;
import com.example.demo.dto.InventoryResponseDTO;
import com.example.demo.dto.UpdateStockRequest;
import com.example.demo.dto.ImportItemDTO;
import com.example.demo.model.Category; 
import com.example.demo.service.InventoryService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping; 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping; 
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List; 

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("items")
    public ResponseEntity<Page<InventoryResponseDTO>> getAllItems(
            @RequestParam(value = "supplierId", required = false) Long supplierId,
            @RequestParam(value = "search", required = false) String search, 
            @RequestParam(value = "categoryId", required = false) Long categoryId, 
            Pageable pageable) { 
        
        Page<InventoryResponseDTO> itemsPage;
        if (supplierId != null) {
            itemsPage = inventoryService.getItemsBySupplier(supplierId, search, categoryId, pageable);
        } else {
            itemsPage = inventoryService.getAllItems(search, categoryId, pageable);
        }
        return ResponseEntity.ok(itemsPage);
    }
    
    @GetMapping("/items/{id}")
    public ResponseEntity<InventoryResponseDTO> getItemDetails(@PathVariable("id") Long id) {
        return ResponseEntity.ok(inventoryService.getItemDetails(id));
    }
    
    @PostMapping("/items")
    public ResponseEntity<InventoryResponseDTO> createInventoryItem(@RequestBody CreateItemRequest request) {
        InventoryResponseDTO newItemDTO = inventoryService.addFruit(request);
        return new ResponseEntity<>(newItemDTO, HttpStatus.CREATED);
    }
    
    @PostMapping("/import-stock")
    public ResponseEntity<Void> importStock(@RequestBody List<ImportItemDTO> itemsToImport) {
        inventoryService.importStock(itemsToImport);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteInventoryItem(@PathVariable("id") Long id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.ok().build(); 
    }
    
    @PutMapping("/items/{id}")
    public ResponseEntity<InventoryResponseDTO> updateInventoryItem(
            @PathVariable("id") Long id, 
            @RequestBody CreateItemRequest request) 
    {
        InventoryResponseDTO updatedItemDTO = inventoryService.updateItem(id, request);
        return ResponseEntity.ok(updatedItemDTO);
    }
    
    @PutMapping("/items/{id}/stock")
    public ResponseEntity<Void> updateStock(
            @PathVariable("id") Long id, 
            @RequestBody UpdateStockRequest request) 
    {
        inventoryService.updateStock(id, request);
        return ResponseEntity.ok().build();
    }
    
    
    @GetMapping("/items/all")
    public ResponseEntity<List<InventoryResponseDTO>> getAllItemsList() {
        return ResponseEntity.ok(inventoryService.getAllItemsList());
    }
}