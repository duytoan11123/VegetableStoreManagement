package com.example.orders.repository;

import com.example.orders.dto.BestsellerProjection;
import org.springframework.data.domain.Pageable;
import com.example.orders.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime; // 👈 Import
import java.util.List;
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
	@Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o " +
	           "WHERE o.status != 'CANCELLED' " +
	           "AND o.orderDate BETWEEN :startDate AND :endDate")
	    Double getRevenueBetweenDates(
	            @Param("startDate") LocalDateTime startDate,
	            @Param("endDate") LocalDateTime endDate);
	
	@Query("SELECT oi.productId AS productId, SUM(oi.quantity) AS totalQuantitySold " +
	           "FROM OrderItem oi " +
	           "WHERE oi.order.status != 'CANCELLED' " +
	           "GROUP BY oi.productId " +
	           "ORDER BY totalQuantitySold DESC")
	    List<BestsellerProjection> findBestsellers(Pageable pageable);
}