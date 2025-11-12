package com.example.demo.repository;

import com.example.demo.model.Supplier;
import com.example.demo.model.Supplier.SupplierStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findBySupplierCode(String supplierCode);

    Optional<Supplier> findByEmail(String email);

    Optional<Supplier> findByTaxCode(String taxCode);

    boolean existsBySupplierCode(String supplierCode);

    boolean existsByEmail(String email);

    boolean existsByTaxCode(String taxCode);

    Page<Supplier> findByStatus(SupplierStatus status, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.supplierCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.taxCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<Supplier> searchSuppliers(@Param("keyword") String keyword, 
                                    @Param("status") SupplierStatus status, 
                                    Pageable pageable);
}

