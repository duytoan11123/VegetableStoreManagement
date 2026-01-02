package com.example.demo.dto;

import java.time.Instant;

public class SupplierImportRecordDTO {
    private Long id;
    private Long itemId;
    private Long supplierId;
    private int quantityAdded;
    private double pricePerUnit;
    private Instant importDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public int getQuantityAdded() { return quantityAdded; }
    public void setQuantityAdded(int quantityAdded) { this.quantityAdded = quantityAdded; }
    public double getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(double pricePerUnit) { this.pricePerUnit = pricePerUnit; }
    public Instant getImportDate() { return importDate; }
    public void setImportDate(Instant importDate) { this.importDate = importDate; }
}
