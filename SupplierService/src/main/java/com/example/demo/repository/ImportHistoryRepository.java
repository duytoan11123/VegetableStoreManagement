package com.example.demo.repository;

import com.example.demo.model.ImportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Long> {
    List<ImportHistory> findBySupplierId(Long supplierId);
    @Query("SELECT h FROM ImportHistory h WHERE h.importDate BETWEEN :startDate AND :endDate")
    List<ImportHistory> findByImportDateBetween(
        @Param("startDate") Instant startDate, 
        @Param("endDate") Instant endDate
    );
}