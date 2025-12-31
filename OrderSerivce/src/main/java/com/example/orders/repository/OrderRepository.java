package com.example.orders.repository;

import com.example.orders.dto.BestsellerDTO;
import com.example.orders.dto.BestsellerProjection;
import com.example.orders.dto.DailyRevenueDTO;
import com.example.orders.dto.DailyRevenueProjection;

import org.springframework.data.domain.Page;
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
	@Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o " +
	           "WHERE o.status != 'CANCELLED' " +
	           "AND o.orderDate BETWEEN :startDate AND :endDate")
	    Double getRevenueBetweenDates(
	            @Param("startDate") LocalDateTime startDate,
	            @Param("endDate") LocalDateTime endDate);
	
	@Query("SELECT new com.example.orders.dto.BestsellerDTO(oi.productId, oi.productName, COALESCE(SUM(oi.quantity), 0)) " +
	           "FROM OrderItem oi JOIN oi.order o " +
	           "WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') " +
	           "GROUP BY oi.productId, oi.productName " +
	           "ORDER BY COALESCE(SUM(oi.quantity), 0) DESC")
	    List<BestsellerDTO> findBestsellers(Pageable pageable);

	@Query("SELECT function('DATE', o.orderDate) as date, SUM(o.totalPrice) as revenue " +
	           "FROM Order o " +
	           "WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') " +
	           "AND o.orderDate >= :startDate " +
	           "GROUP BY function('DATE', o.orderDate) " +
	           "ORDER BY function('DATE', o.orderDate) ASC")
	    List<DailyRevenueProjection> getDailyRevenueSince(@Param("startDate") LocalDateTime startDate);
	
	
	@Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate BETWEEN :start AND :end")
    Long countOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
	
	Page<Order> findAllByOrderDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}