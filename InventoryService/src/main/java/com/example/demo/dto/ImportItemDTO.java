package com.example.demo.dto;


public record ImportItemDTO(
    Long itemId,
    int quantityToAdd,
    double price
) {}