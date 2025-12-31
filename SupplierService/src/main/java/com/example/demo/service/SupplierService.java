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

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private ImportHistoryRepository importHistoryRepository;

    
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

            LocalDateTime localImportDate = req.getImportDate() != null ? req.getImportDate() : LocalDateTime.now();

            history.setImportDate(localImportDate.atZone(ZoneId.systemDefault()).toInstant());

            importHistoryRepository.save(history);
        }
    }
    public Supplier addSupplier(CreateSupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        
        return supplierRepository.save(supplier);
    }

    public Supplier getSupplierInfo(Long supplierId) {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Nhà cung cấp với ID: " + supplierId));
    }
    
    public Supplier updateSupplier(Long id,EditSupplierRequest request) {
    	Supplier supplier = supplierRepository.findById(id)
    			.orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Supplier ID: " + id));
    	supplier.setAddress(request.getAddress());
    	supplier.setContactPerson(request.getContactPerson());
    	supplier.setEmail(request.getEmail());
    	supplier.setName(request.getName());
    	supplier.setPhone(request.getPhone());
    	return supplierRepository.save(supplier);
    }
    
    public void deleteSupplier(Long id) {
    	supplierRepository.deleteById(id);
    }
    
    public List<Supplier> getAll(){
    	return supplierRepository.findAll();
    }
    public List<Supplier> getAllSuppliers(String search) {
        if (search != null && !search.isEmpty()) {
            return supplierRepository.findByNameContainingIgnoreCase(search);
        } else {
            return supplierRepository.findAll();
        }
    }
}