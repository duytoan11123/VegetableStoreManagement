package com.example.demo.repository;

import com.example.demo.model.ImportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Long> {
	List<ImportHistory> findBySupplierIdOrderByImportDateDesc(Long supplierId);
}