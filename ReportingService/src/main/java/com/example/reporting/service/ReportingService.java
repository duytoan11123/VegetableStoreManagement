package com.example.reporting.service;

import com.example.reporting.dto.BestsellerReportItem;
import com.example.reporting.dto.DashboardOverviewResponse;
import com.example.reporting.dto.DashboardOverviewResponse.*;
import com.example.reporting.dto.RevenueReport;
import com.example.reporting.dto.internal.InventoryItemDTO;
import com.example.reporting.dto.internal.OrderServiceBestsellerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
public class ReportingService {
	private static final Logger logger = LoggerFactory.getLogger(ReportingService.class);
    @Autowired
    private RestTemplate restTemplate;

    @Value("${order.service.name}")
    private String orderService; // "order-service"

    @Value("${inventory.service.name}")
    private String inventoryService; // "inventory-service"

    
    public DashboardOverviewResponse getDashboardData() {
        long start = System.currentTimeMillis();
        DashboardOverviewResponse response = new DashboardOverviewResponse();

        // --- 1. INVENTORY: Tổng Tồn Kho ---
        // Gọi API: /api/inventory/metrics/totalQuantity
        CompletableFuture<Integer> totalQtyFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.getForObject(
                    "http://" + inventoryService + "/api/inventory/metrics/totalQuantity", 
                    Integer.class
                );
            } catch (Exception e) {
                logger.error("Failed to get Total Quantity", e);
                return 0;
            }
        });

        // --- 2. INVENTORY: Hàng tồn kho thấp (Số lượng & Danh sách) ---
        // Gọi API: /api/inventory/metrics/lowStock
        // Chúng ta gọi 1 lần lấy 5 item để vừa có số tổng (totalElements) vừa có list hiển thị
        CompletableFuture<Map> lowStockPageFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.getForObject(
                    "http://"+inventoryService+"/api/inventory/metrics/lowStock?page=0&size=5", 
                    Map.class // Spring trả về Page dưới dạng Map JSON
                );
            } catch (Exception e) {
                logger.error("Failed to get Low Stock", e);
                return null;
            }
        });

        // --- 3. ORDER: Đơn hàng mới & Tăng trưởng ---
        CompletableFuture<OrderSummary> orderGrowthFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.getForObject("http://" + orderService + "/api/orders/metrics/growth", OrderSummary.class);
            } catch (Exception e) {
                return new OrderSummary(0, 0.0);
            }
        });

        // --- 4. ORDER: Doanh thu tháng ---
        CompletableFuture<RevenueSummary> revenueMonthFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.getForObject("http://" + orderService + "/api/orders/metrics/monthly-revenue", RevenueSummary.class);
            } catch (Exception e) {
                return new RevenueSummary(0.0, 0.0);
            }
        });

        // --- 5. ORDER: Biểu đồ ---
        CompletableFuture<List<DailyRevenueChartItem>> chartFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.exchange(
                    "http://" + orderService + "/api/orders/metrics/revenue-chart?days=7",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<DailyRevenueChartItem>>() {}
                ).getBody();
            } catch (Exception e) {
                return new ArrayList<>();
            }
        });

        // --- 6. ORDER: Bestsellers ---
        CompletableFuture<List<BestsellerItem>> bestsellerFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.exchange(
                    "http://" + orderService + "/api/orders/metrics/bestsellers",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<BestsellerItem>>() {}
                ).getBody();
            } catch (Exception e) {
                return new ArrayList<>();
            }
        });

        // --- CHỜ TẤT CẢ HOÀN THÀNH (JOIN) ---
        CompletableFuture.allOf(
            totalQtyFuture, lowStockPageFuture, orderGrowthFuture, 
            revenueMonthFuture, chartFuture, bestsellerFuture
        ).join();

        // --- GÁN DỮ LIỆU VÀO RESPONSE ---

        // 1. Xử lý Inventory Data
        Integer totalQty = totalQtyFuture.join();
        Map lowStockData = lowStockPageFuture.join();
        
        long lowStockCount = 0;
        List<LowStockItem> lowStockItemsList = new ArrayList<>();

        if (lowStockData != null) {
            // Lấy totalElements từ Page object
            lowStockCount = ((Number) lowStockData.getOrDefault("totalElements", 0)).longValue();
            
            // Lấy content (danh sách item) từ Page object
            List<Map<String, Object>> content = (List<Map<String, Object>>) lowStockData.get("content");
            if (content != null) {
                for (Map<String, Object> item : content) {
                    LowStockItem lowItem = new LowStockItem();
                    lowItem.setId(((Number) item.get("id")).longValue());
                    lowItem.setName((String) item.get("name"));
                    lowItem.setQuantity(((Number) item.get("quantity")).intValue());
                    lowItem.setStatus((String) item.get("status"));
                    lowItem.setCategoryName((String) item.get("categoryName"));
                    lowStockItemsList.add(lowItem);
                }
            }
        }
        
        // Set Inventory Summary
        response.setInventory(new InventorySummary(totalQty));
        // Set Low Stock List (cho bảng)
        response.setLowStockItems(lowStockItemsList);

        // 2. Xử lý Order Data
        response.setOrders(orderGrowthFuture.join());
        response.setRevenue(revenueMonthFuture.join());
        response.setRevenueChart(chartFuture.join());
        response.setTopSellingItems(bestsellerFuture.join());

        logger.info("Dashboard data aggregated in {} ms", System.currentTimeMillis() - start);
        return response;
    }
}