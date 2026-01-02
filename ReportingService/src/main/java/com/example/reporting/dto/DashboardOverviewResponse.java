package com.example.reporting.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    
    // Tổng quan (Cards)
    private InventorySummary inventory; // Tổng tồn kho
    private OrderSummary orders;        // Đơn hàng mới & tăng trưởng
    private RevenueSummary revenue;     // Doanh thu tháng & tăng trưởng

    // Biểu đồ
    private List<DailyRevenueChartItem> revenueChart; // 7 ngày gần nhất

    // Bảng dữ liệu
    private List<BestsellerItem> topSellingItems; // Top 5 bán chạy
    private List<LowStockItem> lowStockItems;     // Sản phẩm tồn kho thấp


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventorySummary {
        private int totalQuantity;    // Tổng số lượng (kg)
        private long lowStockCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummary {
        private long todayOrders;     
        private double growthRate;    
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueSummary {
        private double currentMonthRevenue; 
        private double growthRate;          
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenueChartItem {
        private LocalDate date;
        private Double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BestsellerItem {
        private Long productId;
        private String productName;
        private Long totalQuantity;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockItem {
        private Long id;
        private String name;
        private int quantity;
        private String status;
        private String categoryName;
    }
    
}