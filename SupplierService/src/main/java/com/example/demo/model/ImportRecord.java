package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "import_date", nullable = false)
    private LocalDateTime importDate;

    @Column(name = "items", length = 1000)
    private String items; // simple JSON or text description of items/quantities

    @Column(name = "total_amount")
    private Double totalAmount;
}
