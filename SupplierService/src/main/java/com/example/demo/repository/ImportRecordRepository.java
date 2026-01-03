package com.example.demo.repository;

import com.example.demo.model.ImportRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportRecordRepository extends JpaRepository<ImportRecord, Long> {
    List<ImportRecord> findBySupplierIdOrderByImportDateDesc(Long supplierId);
}
