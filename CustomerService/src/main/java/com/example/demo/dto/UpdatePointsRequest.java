package com.example.demo.dto;

import lombok.Data;

@Data
public class UpdatePointsRequest {
    // Số điểm cần cộng thêm (có thể là số âm nếu trừ điểm)
    private int pointsToAdd;
}