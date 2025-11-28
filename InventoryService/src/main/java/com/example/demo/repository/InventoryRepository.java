package com.example.demo.repository;

import com.example.demo.model.InventoryItem;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByName(String name);
    List<InventoryItem> findBySupplierId(Long supplierId);
    
    
    @Query(value = "SELECT i FROM InventoryItem i LEFT JOIN FETCH i.category c " +
                   "WHERE (COALESCE(:search, '') = '' OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                   "AND (COALESCE(:categoryId, 0) = 0 OR i.category.id = :categoryId)", 
           countQuery = "SELECT count(i) FROM InventoryItem i " +
                        "WHERE (COALESCE(:search, '') = '' OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "AND (COALESCE(:categoryId, 0) = 0 OR i.category.id = :categoryId)") 
    Page<InventoryItem> findAllWithCategory(
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        Pageable pageable
    );
    
    
    @Query(value = "SELECT i FROM InventoryItem i LEFT JOIN FETCH i.category c " +
                   "WHERE i.supplierId = :supplierId " +
                   "AND (COALESCE(:search, '') = '' OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                   "AND (COALESCE(:categoryId, 0) = 0 OR i.category.id = :categoryId)", 
           countQuery = "SELECT count(i) FROM InventoryItem i " +
                        "WHERE i.supplierId = :supplierId " +
                        "AND (COALESCE(:search, '') = '' OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "AND (COALESCE(:categoryId, 0) = 0 OR i.category.id = :categoryId)") 
    Page<InventoryItem> findBySupplierIdWithCategory(
        @Param("supplierId") Long supplierId, 
        @Param("search") String search,
        @Param("categoryId") Long categoryId, 
        Pageable pageable
    );
    
    @Query("SELECT i FROM InventoryItem i LEFT JOIN FETCH i.category c WHERE i.id = :id")
    Optional<InventoryItem> findByIdWithCategory(@Param("id") Long id);
    
    @Query("SELECT COALESCE(SUM(i.quantity), 0) as totalQuantity from InventoryItem i")
    int getTotalQuantity();
    
    @Query(value = "SELECT i FROM InventoryItem i LEFT JOIN FETCH i.category c WHERE i.status = 'LOW' OR i.status = 'SOLDOUT'",
            countQuery = "SELECT count(i) FROM InventoryItem i WHERE i.status = 'LOW' OR i.status = 'SOLDOUT'")
     Page<InventoryItem> getLowStockItem(Pageable pageable);
}