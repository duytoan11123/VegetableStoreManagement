package com.example.demo.repository;

import com.example.demo.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    
    // Tùy chọn: Thêm phương thức tìm theo tên để tránh trùng lặp
    Optional<InventoryItem> findByName(String name);
    List<InventoryItem> findBySupplierId(Long supplierId);
    List<InventoryItem> findAll();
}