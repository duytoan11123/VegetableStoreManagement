package com.example.demo.repository;

import com.example.demo.model.Supplier;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
	List<Supplier> findByNameContainingIgnoreCase(String name);

}