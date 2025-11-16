package com.example.demo.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import jakarta.persistence.Column;
import java.time.Instant;

@Entity
@Table(name = "import_history")
@Data
public class ImportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long itemId; // ID của InventoryItem

    @Column(nullable = false)
    private Long supplierId; // ID của Supplier

    @Column(nullable = false)
    private int quantityAdded; // Số lượng đã nhập

    @Column(nullable = false)
    private double pricePerUnit; // Đơn giá tại thời điểm nhập

    @Column(nullable = false)
    private Instant importDate; // Thời điểm nhập
}