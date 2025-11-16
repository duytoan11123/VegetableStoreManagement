package com.example.demo.model;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Entity
@Data 
@NoArgsConstructor
@AllArgsConstructor
public class Category {
	@Id
	private Long id;
	private String name;
	@OneToMany(
	        mappedBy = "category",
	        cascade = CascadeType.ALL,
	        orphanRemoval = true
	    )
	@JsonManagedReference
	private List<InventoryItem> items;
	
	public void addItem(InventoryItem item) {
	    this.items.add(item);   
	    item.setCategory(this); 
	}
}
