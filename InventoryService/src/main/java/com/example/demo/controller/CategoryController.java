package com.example.demo.controller;

import com.example.demo.dto.CreateCategoryRequest;
import com.example.demo.model.Category;
import com.example.demo.service.CategoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
@RestController
@RequestMapping("/api/inventory/categories")
public class CategoryController {
	@Autowired
	private CategoryService categoryService;
	
	@GetMapping
	public ResponseEntity<List<Category>> getAll() {
		return ResponseEntity.ok(categoryService.getAll());
	}
	// THÊM MỚI
    @PostMapping
    public ResponseEntity<Category> create(@RequestBody CreateCategoryRequest request) {
        Category newCat = categoryService.create(request.getName());
        return new ResponseEntity<>(newCat, HttpStatus.CREATED);
    }

    // XÓA DANH MỤC
   @DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
    categoryService.delete(id);
    return ResponseEntity.ok().build();
}
}
