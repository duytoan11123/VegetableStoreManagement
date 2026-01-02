package com.example.demo.dto;

import java.time.Instant;

public record ImportItemDTO(
    Long itemId,
    int quantityToAdd,
    double price,
    Instant importDate
) {}