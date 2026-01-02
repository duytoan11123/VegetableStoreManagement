package com.example.demo.service;

import com.example.demo.dto.CreateItemRequest;
import com.example.demo.dto.InventoryResponseDTO;
import com.example.demo.dto.UpdateStockRequest;
import com.example.demo.dto.ImportItemDTO; 
import com.example.demo.model.Category;
import com.example.demo.model.InventoryItem;
import com.example.demo.model.STATUS;
import com.example.demo.model.ImportHistory; 
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.repository.ImportHistoryRepository; 

import jakarta.persistence.EntityNotFoundException; 
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant; 
import java.util.ArrayList; 
import java.util.List; 
import java.util.Map; 
import java.util.stream.Collectors; 

@Service
@Transactional 
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private CategoryRepository categoryRepository; 
    @Autowired
    private ImportHistoryRepository importHistoryRepository; 
    public List<InventoryItem> getItemsBySupplier(Long supplierId) {
    return inventoryRepository.findBySupplierIdForHistory(supplierId);
}
    
    
  
    
    @Transactional(readOnly = true) 
    public Page<InventoryResponseDTO> getAllItems(String search, Long categoryId, Pageable pageable) {
        Page<InventoryItem> inventoryData = inventoryRepository.findAllWithCategory(search, categoryId, pageable);
        return inventoryData.map(this::mapToInventoryDTO);
    }
    
    @Transactional(readOnly = true)
    public Page<InventoryResponseDTO> getItemsBySupplier(Long supplierId, String search, Long categoryId, Pageable pageable) {
        Page<InventoryItem> inventoryData = inventoryRepository.findBySupplierIdWithCategory(supplierId, search, categoryId, pageable);
        return inventoryData.map(this::mapToInventoryDTO);
    }
    
    @Transactional(readOnly = true)
    public InventoryResponseDTO getItemDetails(Long id) {
        return inventoryRepository.findByIdWithCategory(id)
            .map(this::mapToInventoryDTO) 
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy InventoryItem với ID: " + id));
    }

  
    @Transactional(readOnly = true)
    public List<ImportHistory> getImportHistoryBySupplier(Long supplierId) {
        if (supplierId != null) {

            return importHistoryRepository.findAll(); 
        }
        return importHistoryRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Category getCategory(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Category với ID: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    // --- 2. CÁC HÀM THÊM / SỬA / XÓA ---

    @Transactional
    public InventoryResponseDTO addFruit(CreateItemRequest request) {
        if (inventoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Trái cây với tên '" + request.getName() + "' đã tồn tại.");
        }
        Category category = getCategory(request.getCategoryId());
        InventoryItem newItem = new InventoryItem();
        newItem.setName(request.getName());
        newItem.setQuantity(request.getQuantity());
        newItem.setPrice(request.getPrice());
        newItem.setSupplierId(request.getSupplierId());
        
        
        if (request.getQuantity() == 0) {
        	newItem.setStatus(STATUS.SOLDOUT);
        }
        else if (request.getQuantity() < 50) {
            newItem.setStatus(STATUS.LOW);
        } else {
            newItem.setStatus(STATUS.AVAILABLE);
        }
        
        category.addItem(newItem); 
        InventoryItem savedItem = inventoryRepository.save(newItem);
        return mapToInventoryDTO(savedItem);
    }
    
    @Transactional
    public void deleteItem(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy Item để xóa với ID: " + id);
        }
        inventoryRepository.deleteById(id);
    }
    
    @Transactional
    public InventoryResponseDTO updateItem(Long id, CreateItemRequest request) {
        InventoryItem itemToUpdate = inventoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Item để cập nhật với ID: " + id));
        Category category = getCategory(request.getCategoryId());
        itemToUpdate.setName(request.getName());
        itemToUpdate.setQuantity(request.getQuantity());
        itemToUpdate.setPrice(request.getPrice());
        itemToUpdate.setSupplierId(request.getSupplierId());
        itemToUpdate.setCategory(category); 
        
        if (request.getQuantity() == 0) {
             itemToUpdate.setStatus(STATUS.SOLDOUT);
        } else if (request.getQuantity() < 50) {
            itemToUpdate.setStatus(STATUS.LOW);
        } else {
            itemToUpdate.setStatus(STATUS.AVAILABLE);
        }
        InventoryItem updatedItem = inventoryRepository.save(itemToUpdate);
        return mapToInventoryDTO(updatedItem);
    }

    @Transactional
    public void importStock(List<ImportItemDTO> itemsToImport) {
        List<Long> itemIds = itemsToImport.stream()
                                          .map(ImportItemDTO::itemId)
                                          .collect(Collectors.toList());
        
        List<InventoryItem> itemsInDb = inventoryRepository.findAllById(itemIds);
        Map<Long, InventoryItem> itemMap = itemsInDb.stream()
            .collect(Collectors.toMap(InventoryItem::getId, item -> item));
        
        List<ImportHistory> historyList = new ArrayList<>();

        for (ImportItemDTO importItem : itemsToImport) {
            InventoryItem item = itemMap.get(importItem.itemId());
            if (item != null) {
                int newQuantity = item.getQuantity() + importItem.quantityToAdd();
                item.setQuantity(newQuantity);
                item.setPrice(importItem.price()); 
                
                if (newQuantity == 0) {
                    item.setStatus(STATUS.SOLDOUT);
                } else if (newQuantity < 50) {
                    item.setStatus(STATUS.LOW);
                } else {
                    item.setStatus(STATUS.AVAILABLE);
                }
                
                ImportHistory history = new ImportHistory();
                history.setItemId(item.getId());
                history.setSupplierId(item.getSupplierId());
                history.setQuantityAdded(importItem.quantityToAdd());
                history.setPricePerUnit(importItem.price());
                history.setImportDate(Instant.now());
                historyList.add(history);
            } 
        }
        inventoryRepository.saveAll(itemsInDb);
        importHistoryRepository.saveAll(historyList); 
    }
    
    public InventoryItem updateStock(Long id, UpdateStockRequest request) {
		InventoryItem item = inventoryRepository.findById(id)
	            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Item (để cập nhật kho) với ID: " + id));

	        int newQuantity = request.getNewQuantity();
	        item.setQuantity(newQuantity);
	        
	        if (newQuantity == 0) {
	             item.setStatus(STATUS.SOLDOUT);
	        } else if (newQuantity < 50) {
	            item.setStatus(STATUS.LOW);
	        } else {
	            item.setStatus(STATUS.AVAILABLE);
	        }
	        return inventoryRepository.save(item);
	}
    
    @Transactional(readOnly=true)
    public Page<InventoryResponseDTO> getLowStockItem(Pageable pageable){
    	Page<InventoryItem> itemData= inventoryRepository.getLowStockItem(pageable);
    	return itemData.map(this::mapToInventoryDTO);
    }
    
    @Transactional(readOnly=true)
    public int getTotalQuantity() {
    	return inventoryRepository.getTotalQuantity();
    }

   
    private InventoryResponseDTO mapToInventoryDTO(InventoryItem data) {
        InventoryResponseDTO a = new InventoryResponseDTO();
        a.setId(data.getId());
        a.setName(data.getName());
        a.setPrice(data.getPrice());
        a.setQuantity(data.getQuantity());
        a.setSupplierId(data.getSupplierId());
        
        //  THÊM DÒNG NÀY ĐỂ LẤY NGÀY TỪ DATABASE LÊN
        a.setAddedDate(data.getCreatedAt()); 

        if (data.getCategory() != null) {
            a.setCategoryName(data.getCategory().getName());
        }
        if (data.getStatus() != null) {
            a.setStatus(data.getStatus().name()); 
        }
        return a;
    }
}