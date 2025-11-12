package com.example.orders.dto;

import com.example.orders.model.OrderStatus;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    private OrderStatus newStatus;
}