package com.example.reporting.service;

import com.example.reporting.dto.BestsellerReportItem;
import com.example.reporting.dto.DashboardOverviewResponse;
import com.example.reporting.dto.DashboardOverviewResponse.*;
import com.example.reporting.dto.RevenueReportDTO;
import com.example.reporting.dto.internal.InventoryItemDTO;
import com.example.reporting.dto.internal.OrderServiceBestsellerDTO;

import lombok.Data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

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

    @Data
    public static class RawInventoryItem {
        private Long id;
        private String name;
        private int quantity;
        private double price;
        private String status;       
        private String categoryName;
    }
    
    @Data
    public static class RawImportHistory {
        private Long id;
        private String itemName;
        private int quantityAdded;
        private double pricePerUnit;
        private String importDate; 
    }
    
    public DashboardOverviewResponse getDashboardData() {
        DashboardOverviewResponse response = new DashboardOverviewResponse();

        CompletableFuture<List<RawInventoryItem>> inventoryFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.exchange(
                    "http://inventory-service/api/inventory/items/all",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<RawInventoryItem>>() {}
                ).getBody();
            } catch (Exception e) {
                return new ArrayList<>();
            }
        });

        CompletableFuture<OrderSummary> orderGrowthFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.getForObject("http://order-service/api/orders/metrics/growth", OrderSummary.class);
            } catch (Exception e) { return new OrderSummary(0, 0.0); }
        });

        CompletableFuture<RevenueSummary> revenueMonthFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.getForObject("http://order-service/api/orders/metrics/monthly-revenue", RevenueSummary.class);
            } catch (Exception e) { return new RevenueSummary(0.0, 0.0); }
        });
        
        CompletableFuture<List<DailyRevenueChartItem>> chartFuture = CompletableFuture.supplyAsync(() -> {
             try {
                return restTemplate.exchange("http://order-service/api/orders/metrics/revenue-chart?days=7",
                    HttpMethod.GET, null, new ParameterizedTypeReference<List<DailyRevenueChartItem>>() {}).getBody();
            } catch (Exception e) { return new ArrayList<>(); }
        });
        
        CompletableFuture<List<BestsellerItem>> bestsellerFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return restTemplate.exchange("http://order-service/api/orders/metrics/bestsellers?limit=5",
                    HttpMethod.GET, null, new ParameterizedTypeReference<List<BestsellerItem>>() {}).getBody();
            } catch (Exception e) {
                return new ArrayList<>(); 
            }
        });
        
        CompletableFuture.allOf(inventoryFuture, orderGrowthFuture, revenueMonthFuture, chartFuture, bestsellerFuture).join();
        
        List<RawInventoryItem> allItems = inventoryFuture.join();


        int totalQuantity = 0;
        long lowStockCount = 0;
        List<LowStockItem> lowStockList = new ArrayList<>();

        if (allItems != null) {
            for (RawInventoryItem item : allItems) {
                totalQuantity += item.quantity;
                boolean isLow = item.quantity < 50 || "LOW".equals(item.status) || "SOLDOUT".equals(item.status);
                
                if (isLow) {
                    lowStockCount++;
                    if (lowStockList.size() < 10) {
                        LowStockItem lowItem = new LowStockItem();
                        lowItem.setId(item.id);
                        lowItem.setName(item.name);
                        lowItem.setQuantity(item.quantity);
                        lowItem.setStatus(item.status);
                        lowItem.setCategoryName(item.categoryName);
                        lowStockList.add(lowItem);
                    }
                }
            }
        }

        response.setInventory(new InventorySummary(totalQuantity, lowStockCount));
        response.setLowStockItems(lowStockList);

        response.setOrders(orderGrowthFuture.join());
        response.setRevenue(revenueMonthFuture.join());
        response.setRevenueChart(chartFuture.join());
        response.setTopSellingItems(bestsellerFuture.join());

        return response;
    }
    
    public RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate) {
        try {
            String url = "http://order-service/api/reports/revenue?startDate=" + startDate + "&endDate=" + endDate;
            return restTemplate.getForObject(url, RevenueReportDTO.class);
        } catch (Exception e) {
            logger.error("Failed to fetch Revenue Report", e);
            return new RevenueReportDTO(0.0, startDate, endDate);
        }
    }
    
    public List<DailyRevenueChartItem> getRevenueChart(LocalDate startDate, LocalDate endDate) {
        try {
            long daysDiff = ChronoUnit.DAYS.between(startDate, endDate) + 1;
            if (daysDiff < 1) daysDiff = 1;

            String url = String.format(
                "http://order-service/api/orders/metrics/revenue-chart?startDate=%s&endDate=%s&days=%d",
                startDate, endDate, daysDiff
            );
            
            logger.info("Calling Order Service Chart API: {}", url);

            return restTemplate.exchange(
                url,
                HttpMethod.GET, 
                null, 
                new ParameterizedTypeReference<List<DailyRevenueChartItem>>() {}
            ).getBody();
        } catch (Exception e) {
            logger.error("Failed to fetch custom chart data", e);
            return new ArrayList<>();
        }
    }
    
    public byte[] exportMonthlyReport(int month, int year) {
        StringBuilder csv = new StringBuilder();
        
        //  Xác định ngày đầu và cuối tháng (Kiểu LocalDate)
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.with(TemporalAdjusters.lastDayOfMonth());

        //  Lấy Doanh thu (Order Service)
        CompletableFuture<List<DailyRevenueChartItem>> revenueFuture = CompletableFuture.supplyAsync(() -> {
            try {
                String url = String.format("http://order-service/api/orders/metrics/revenue-chart?startDate=%s&endDate=%s", start, end);
                return restTemplate.exchange(url, HttpMethod.GET, null, new ParameterizedTypeReference<List<DailyRevenueChartItem>>() {}).getBody();
            } catch (Exception e) { return new ArrayList<>(); }
        });

        //  Lấy Nhập hàng (Supplier Service)
        CompletableFuture<List<RawImportHistory>> importFuture = CompletableFuture.supplyAsync(() -> {
            try {
                String url = String.format("http://supplier-service/api/suppliers/history?startDate=%s&endDate=%s", start, end);
                return restTemplate.exchange(url, HttpMethod.GET, null, new ParameterizedTypeReference<List<RawImportHistory>>() {}).getBody();
            } catch (Exception e) {
                logger.error("Lỗi lấy lịch sử nhập từ Supplier Service", e);
                return new ArrayList<>();
            }
        });

        CompletableFuture.allOf(revenueFuture, importFuture).join();
        
        List<DailyRevenueChartItem> revenues = revenueFuture.join();
        List<RawImportHistory> imports = importFuture.join();

        Map<Integer, Double> revenueByDay = new HashMap<>();
        if (revenues != null) {
            for (DailyRevenueChartItem item : revenues) {
                if (item.getDate().getMonthValue() == month && item.getDate().getYear() == year) {
                    revenueByDay.put(item.getDate().getDayOfMonth(), item.getRevenue());
                }
            }
        }

        Map<Integer, Double> importCostByDay = new HashMap<>();
        Map<Integer, Integer> importCountByDay = new HashMap<>();
        
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");

        if (imports != null) {
            for (RawImportHistory item : imports) {
                try {
                    Instant instant;
                    if (item.getImportDate() != null && item.getImportDate().contains("T")) {
                         instant = Instant.parse(item.getImportDate());
                    } else {
                         try {
                             double ts = Double.parseDouble(item.getImportDate());
                             instant = (ts > 10000000000L) ? Instant.ofEpochMilli((long)ts) : Instant.ofEpochSecond((long)ts);
                         } catch (NumberFormatException e) {
                             logger.warn("Không thể parse ngày nhập: {}", item.getImportDate());
                             continue;
                         }
                    }

                    // Chuyển sang LocalDateTime theo múi giờ VN
                    LocalDateTime ldt = instant.atZone(zoneId).toLocalDateTime();
                    
                    // Lọc đúng tháng/năm
                    if (ldt.getMonthValue() == month && ldt.getYear() == year) {
                        int day = ldt.getDayOfMonth();
                        double cost = item.getQuantityAdded() * item.getPricePerUnit();
                        
                        importCostByDay.merge(day, cost, Double::sum);
                        importCountByDay.merge(day, 1, Integer::sum);
                    }
                } catch (Exception e) {
                    logger.error("Lỗi xử lý item nhập hàng ID " + item.getId(), e);
                }
            }
        }

        // Xây dựng nội dung CSV
        csv.append("BAO CAO KINH DOANH THANG ").append(month).append("/").append(year).append("\n");
        csv.append("Ngay tao,").append(LocalDate.now()).append("\n\n");
        csv.append("Ngay,Doanh Thu (VND),Chi Phi Nhap (VND),Loi Nhuan Gop (VND),Ghi Chu\n");

        double totalRevenue = 0;
        double totalImportCost = 0;
        int daysInMonth = end.getDayOfMonth();

        for (int i = 1; i <= daysInMonth; i++) {
            double rev = revenueByDay.getOrDefault(i, 0.0);
            double imp = importCostByDay.getOrDefault(i, 0.0);
            double profit = rev - imp;
            int importTimes = importCountByDay.getOrDefault(i, 0);

            totalRevenue += rev;
            totalImportCost += imp;

            String note = importTimes > 0 ? "Nhap " + importTimes + " lo" : "";

            csv.append(i).append("/").append(month).append("/").append(year).append(",")
               .append(String.format("%.0f", rev)).append(",")
               .append(String.format("%.0f", imp)).append(",")
               .append(String.format("%.0f", profit)).append(",")
               .append(note).append("\n");
        }

        csv.append("TONG CONG,")
           .append(String.format("%.0f", totalRevenue)).append(",")
           .append(String.format("%.0f", totalImportCost)).append(",")
           .append(String.format("%.0f", totalRevenue - totalImportCost)).append("\n");

        return ("\uFEFF" + csv.toString()).getBytes(StandardCharsets.UTF_8);
    }
}