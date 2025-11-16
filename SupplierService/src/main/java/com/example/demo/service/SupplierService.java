package com.example.demo.service;

import com.example.demo.dto.CreateSupplierRequest;
import com.example.demo.model.Supplier;
import com.example.demo.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;


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