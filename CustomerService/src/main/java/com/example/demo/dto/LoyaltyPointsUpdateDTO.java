package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

public class LoyaltyPointsUpdateDTO {

    @NotNull(message = "Points is required")
    private Integer points;

    private String reason;

    // Constructors
    public LoyaltyPointsUpdateDTO() {
    }

    // Getters and Setters
    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

