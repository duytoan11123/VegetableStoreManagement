package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.exception.ItemNotFoundException;
import com.example.demo.model.Category;
import com.example.demo.model.InventoryItem;
import com.example.demo.repository.CategoryRepository;
import org.springframework.transaction.annotation.Transactional;
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
    @Transactional
public Category create(String name) {
    if (name == null || name.trim().isEmpty()) {
        throw new IllegalArgumentException("Tên danh mục không được để trống");
    }
    Category cat = new Category();
    cat.setName(name.trim());
    return categoryRepository.save(cat);
}

@Transactional
public void delete(Long id) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new ItemNotFoundException("Danh mục không tồn tại: " + id));

    // Kiểm tra xem danh mục có sản phẩm nào không
    if (!category.getItems().isEmpty()) {
        throw new IllegalStateException("Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này.");
    }

    categoryRepository.deleteById(id);
}
}
