package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "import_history")
@Data
public class ImportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private Long itemId; 

    @Column(nullable = false)
    private String itemName; 

    @Column(nullable = false)
    private int quantityAdded;

    @Column(nullable = false)
    private double pricePerUnit;

    @Column(nullable = false)
    private Instant importDate;

    @PrePersist
    protected void onCreate() {
        if (this.importDate == null) {
            this.importDate = Instant.now();
        }
    }
}