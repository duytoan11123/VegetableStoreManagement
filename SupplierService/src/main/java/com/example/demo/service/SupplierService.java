package com.example.demo.service;

import com.example.demo.dto.CreateSupplierRequest;
import com.example.demo.dto.EditSupplierRequest;
import com.example.demo.dto.ImportHistoryRequest;
import com.example.demo.model.ImportHistory;
import com.example.demo.model.Supplier;
import com.example.demo.repository.ImportHistoryRepository;
import com.example.demo.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Nên thêm Transactional

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private ImportHistoryRepository importHistoryRepository;

    // --- 1. QUẢN LÝ LỊCH SỬ NHẬP HÀNG (Mới chuyển từ Inventory sang) ---

    // Lưu lịch sử nhập hàng (được gọi từ InventoryService qua API)
    @Transactional
    public void saveImportHistoryBatch(List<ImportHistoryRequest> requests) {
        for (ImportHistoryRequest req : requests) {
            Supplier supplier = supplierRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Nhà cung cấp với ID: " + req.getSupplierId()));
            
            ImportHistory history = new ImportHistory();
            history.setSupplier(supplier); // Liên kết khóa ngoại
            history.setItemId(req.getItemId());
            history.setItemName(req.getItemName());
            history.setQuantityAdded(req.getQuantityAdded());
            history.setPricePerUnit(req.getPricePerUnit());

            // Xử lý ngày giờ: Nếu request không có ngày thì lấy giờ hiện tại
            LocalDateTime localImportDate = req.getImportDate() != null ? req.getImportDate() : LocalDateTime.now();
            history.setImportDate(localImportDate.atZone(ZoneId.systemDefault()).toInstant());

            importHistoryRepository.save(history);
        }
    }

    // Xem lịch sử nhập hàng của một nhà cung cấp (Cần thêm hàm này để hiển thị lên Web)
    public List<ImportHistory> getImportHistoryBySupplier(Long supplierId) {
        return importHistoryRepository.findBySupplierIdOrderByImportDateDesc(supplierId);
    }

    // --- 2. QUẢN LÝ NHÀ CUNG CẤP (CRUD) ---

    public Supplier addSupplier(CreateSupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setDescription(request.getDescription());

        return supplierRepository.save(supplier);
    }

    public Supplier getSupplierInfo(Long supplierId) {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Nhà cung cấp với ID: " + supplierId));
    }
    
    public Supplier updateSupplier(Long id, EditSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Supplier ID: " + id));
        
        supplier.setName(request.getName()); // Sửa lại thứ tự cho dễ nhìn
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setDescription(request.getDescription());
        
        return supplierRepository.save(supplier);
    }
    
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
             throw new EntityNotFoundException("Không tìm thấy Supplier để xóa ID: " + id);
        }
        supplierRepository.deleteById(id);
    }
    
    // Gộp 2 hàm getAll cũ thành 1 hàm clean hơn
    public List<Supplier> getAllSuppliers(String search) {
        if (search != null && !search.isEmpty()) {
            return supplierRepository.findByNameContainingIgnoreCase(search);
        } else {
            return supplierRepository.findAll();
        }
    }
}