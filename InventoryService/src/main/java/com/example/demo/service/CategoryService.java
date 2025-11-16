package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.exception.ItemNotFoundException;
import com.example.demo.model.Category;
import com.example.demo.model.InventoryItem;
import com.example.demo.repository.CategoryRepository;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    
    public Category getCategory(Long id) {
    	return categoryRepository.findById(id)
    			.orElseThrow(() -> new ItemNotFoundException("Danh mục không hợp lệ " + id));
    }

    public List<Category> getAll(){
    	return categoryRepository.findAll();
    }
}
