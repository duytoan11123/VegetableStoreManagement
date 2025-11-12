package com.example.demo.service;

import com.example.demo.dto.SupplierRequestDTO;
import com.example.demo.dto.SupplierResponseDTO;
import com.example.demo.dto.SupplierStatusUpdateDTO;
import com.example.demo.model.Supplier;
import com.example.demo.model.Supplier.SupplierStatus;
import com.example.demo.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public SupplierResponseDTO createSupplier(SupplierRequestDTO requestDTO) {
        // Check if email already exists
        if (supplierRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + requestDTO.getEmail());
        }

        // Check if tax code already exists (if provided)
        if (requestDTO.getTaxCode() != null && !requestDTO.getTaxCode().trim().isEmpty()) {
            if (supplierRepository.existsByTaxCode(requestDTO.getTaxCode())) {
                throw new RuntimeException("Tax code already exists: " + requestDTO.getTaxCode());
            }
        }

        // Generate supplier code if not provided
        String supplierCode = requestDTO.getSupplierCode();
        if (supplierCode == null || supplierCode.trim().isEmpty()) {
            supplierCode = "NCC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else {
            if (supplierRepository.existsBySupplierCode(supplierCode)) {
                throw new RuntimeException("Supplier code already exists: " + supplierCode);
            }
        }

        Supplier supplier = new Supplier();
        supplier.setSupplierCode(supplierCode);
        supplier.setSupplierName(requestDTO.getSupplierName());
        supplier.setContactPerson(requestDTO.getContactPerson());
        supplier.setEmail(requestDTO.getEmail());
        supplier.setPhoneNumber(requestDTO.getPhoneNumber());
        supplier.setAddress(requestDTO.getAddress());
        supplier.setTaxCode(requestDTO.getTaxCode());
        supplier.setBankAccount(requestDTO.getBankAccount());
        supplier.setBankName(requestDTO.getBankName());
        supplier.setStatus(SupplierStatus.ACTIVE);
        supplier.setRating(0.0);
        supplier.setNotes(requestDTO.getNotes());

        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToResponseDTO(savedSupplier);
    }

    @Transactional(readOnly = true)
    public SupplierResponseDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        return convertToResponseDTO(supplier);
    }

    public SupplierResponseDTO updateSupplier(Long id, SupplierRequestDTO requestDTO) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (!supplier.getEmail().equals(requestDTO.getEmail()) && 
            supplierRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + requestDTO.getEmail());
        }

        // Check if tax code is being changed and if new tax code already exists
        if (requestDTO.getTaxCode() != null && 
            !requestDTO.getTaxCode().trim().isEmpty() &&
            (supplier.getTaxCode() == null || !supplier.getTaxCode().equals(requestDTO.getTaxCode())) &&
            supplierRepository.existsByTaxCode(requestDTO.getTaxCode())) {
            throw new RuntimeException("Tax code already exists: " + requestDTO.getTaxCode());
        }

        // Check if supplier code is being changed and if new code already exists
        if (requestDTO.getSupplierCode() != null && 
            !supplier.getSupplierCode().equals(requestDTO.getSupplierCode()) &&
            supplierRepository.existsBySupplierCode(requestDTO.getSupplierCode())) {
            throw new RuntimeException("Supplier code already exists: " + requestDTO.getSupplierCode());
        }

        supplier.setSupplierCode(requestDTO.getSupplierCode() != null ? 
                                 requestDTO.getSupplierCode() : supplier.getSupplierCode());
        supplier.setSupplierName(requestDTO.getSupplierName());
        supplier.setContactPerson(requestDTO.getContactPerson());
        supplier.setEmail(requestDTO.getEmail());
        supplier.setPhoneNumber(requestDTO.getPhoneNumber());
        supplier.setAddress(requestDTO.getAddress());
        supplier.setTaxCode(requestDTO.getTaxCode());
        supplier.setBankAccount(requestDTO.getBankAccount());
        supplier.setBankName(requestDTO.getBankName());
        supplier.setNotes(requestDTO.getNotes());

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return convertToResponseDTO(updatedSupplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        supplier.setStatus(SupplierStatus.INACTIVE);
        supplierRepository.save(supplier);
    }

    public SupplierResponseDTO updateSupplierStatus(Long id, SupplierStatusUpdateDTO updateDTO) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));

        // Validate status value
        try {
            SupplierStatus.valueOf(updateDTO.getStatus().name());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + updateDTO.getStatus());
        }

        supplier.setStatus(updateDTO.getStatus());
        if (updateDTO.getReason() != null && !updateDTO.getReason().trim().isEmpty()) {
            String currentNotes = supplier.getNotes() != null ? supplier.getNotes() : "";
            supplier.setNotes(currentNotes + "\nStatus changed to " + updateDTO.getStatus() + 
                            ": " + updateDTO.getReason());
        }

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return convertToResponseDTO(updatedSupplier);
    }

    @Transactional(readOnly = true)
    public Page<SupplierResponseDTO> getAllSuppliers(SupplierStatus status, Pageable pageable) {
        Page<Supplier> suppliers;
        if (status != null) {
            suppliers = supplierRepository.findByStatus(status, pageable);
        } else {
            suppliers = supplierRepository.findAll(pageable);
        }
        return suppliers.map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<SupplierResponseDTO> searchSuppliers(String keyword, SupplierStatus status, Pageable pageable) {
        Page<Supplier> suppliers = supplierRepository.searchSuppliers(keyword, status, pageable);
        return suppliers.map(this::convertToResponseDTO);
    }

    private SupplierResponseDTO convertToResponseDTO(Supplier supplier) {
        SupplierResponseDTO dto = new SupplierResponseDTO();
        dto.setId(supplier.getId());
        dto.setSupplierCode(supplier.getSupplierCode());
        dto.setSupplierName(supplier.getSupplierName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setEmail(supplier.getEmail());
        dto.setPhoneNumber(supplier.getPhoneNumber());
        dto.setAddress(supplier.getAddress());
        dto.setTaxCode(supplier.getTaxCode());
        dto.setBankAccount(supplier.getBankAccount());
        dto.setBankName(supplier.getBankName());
        dto.setStatus(supplier.getStatus());
        dto.setRating(supplier.getRating());
        dto.setNotes(supplier.getNotes());
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        return dto;
    }
}

