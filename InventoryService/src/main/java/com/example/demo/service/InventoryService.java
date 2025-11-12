package com.example.demo.service;

import com.example.demo.model.InventoryItem;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.dto.CreateItemRequest;
import com.example.demo.exception.ItemNotFoundException;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    /**
     * 1. Logic cho: ThêmTráiCây()
     * Tạo một mặt hàng trái cây mới trong kho.
     */
    public InventoryItem addFruit(CreateItemRequest request) {
        // Kiểm tra xem trái cây đã tồn tại chưa (dựa vào tên)
        if (inventoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Trái cây với tên '" + request.getName() + "' đã tồn tại.");
        }
        if (request.getSupplierId() == null) { 
            throw new IllegalArgumentException("Cần phải có supplierId để thêm mặt hàng.");
       }
        InventoryItem newItem = new InventoryItem();
        newItem.setName(request.getName());
        newItem.setQuantity(request.getQuantity());
        newItem.setPrice(request.getPrice());
        newItem.setSupplierId(request.getSupplierId());
        return inventoryRepository.save(newItem);
    }

    /**
     * 2. Logic cho: CậpNhậtTồnKho()
     * Cập nhật số lượng tồn kho cho một mặt hàng đã có.
     */
    public InventoryItem updateStock(Long id, int newQuantity) {
        // Tìm mặt hàng theo ID, nếu không thấy thì ném lỗi
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException("Không tìm thấy mặt hàng với ID: " + id));

        // Cập nhật số lượng mới
        item.setQuantity(newQuantity);
        
        // Lưu lại vào CSDL
        return inventoryRepository.save(item);
    }

    /**
     * 3. Logic cho: KiểmTraTồnKho()
     * Lấy số lượng tồn kho hiện tại của một mặt hàng.
     */
    public int checkStock(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException("Không tìm thấy mặt hàng với ID: " + id));

        return item.getQuantity();
    }
    
    /**
     * (Bonus) Hàm tìm kiếm thông tin đầy đủ của một mặt hàng
     */
    public InventoryItem getItemDetails(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException("Không tìm thấy mặt hàng với ID: " + id));
    }
    
    public List<InventoryItem> getItemsBySupplier(Long supplierId) {
        return inventoryRepository.findBySupplierId(supplierId);
    }
    
    public List<InventoryItem> getAllItem(){
    	return inventoryRepository.findAll();
    }
}
