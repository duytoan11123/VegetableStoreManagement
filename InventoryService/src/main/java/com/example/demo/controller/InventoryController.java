package com.example.demo.controller;

import com.example.demo.model.InventoryItem;
import com.example.demo.service.InventoryService;
import com.example.demo.dto.CreateItemRequest;
import com.example.demo.dto.UpdateStockRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory") // Tiền tố chung cho tất cả API kho hàng
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    /**
     * Endpoint cho: ThêmTráiCây()
     * POST /api/inventory/items
     */
    @PostMapping("/items")
    public ResponseEntity<InventoryItem> addFruit(@RequestBody CreateItemRequest request) {
        InventoryItem newItem = inventoryService.addFruit(request);
        return new ResponseEntity<>(newItem, HttpStatus.CREATED);
    }

    /**
     * Endpoint cho: CậpNhậtTồnKho()
     * PUT /api/inventory/items/{id}/stock
     */
    @PutMapping("/items/{id}/stock")
    public ResponseEntity<InventoryItem> updateStock(@PathVariable("id") Long id, @RequestBody UpdateStockRequest request) {
        InventoryItem updatedItem = inventoryService.updateStock(id, request.getNewQuantity());
        return ResponseEntity.ok(updatedItem);
    }

    /**
     * Endpoint cho: KiểmTraTồnKho()
     * GET /api/inventory/items/{id}/stock
     */
    @GetMapping("/items/{id}/stock")
    public ResponseEntity<Map<String, Object>> checkStock(@PathVariable("id") Long id) {
        int currentStock = inventoryService.checkStock(id);
        
        // Trả về JSON rõ ràng
        Map<String, Object> response = Map.of(
            "id", id,
            "quantity", currentStock
        );
        return ResponseEntity.ok(response);
    }

    /**
     * (Bonus) Endpoint để lấy toàn bộ thông tin mặt hàng
     * GET /api/inventory/items/{id}
     */
    @GetMapping("/items/{id}")
    public ResponseEntity<InventoryItem> getItemDetails(@PathVariable("id") Long id) {
        InventoryItem item = inventoryService.getItemDetails(id);
        return ResponseEntity.ok(item);
    }
    
    @GetMapping("/items")
    public ResponseEntity<List<InventoryItem>> getAllItems(
            @RequestParam(name = "supplierId", required = false) Long supplierId) {
        
        if (supplierId != null) {
            // Nếu có supplierId, lọc theo nó
            List<InventoryItem> items = inventoryService.getItemsBySupplier(supplierId);
            return ResponseEntity.ok(items);
        } else {
            List<InventoryItem> allItems = inventoryService.getAllItem();
            return ResponseEntity.ok(allItems);
        }
    }
}