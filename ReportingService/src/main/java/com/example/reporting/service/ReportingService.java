package com.example.reporting.service;

import com.example.reporting.dto.BestsellerReportItem;
import com.example.reporting.dto.RevenueReport;
import com.example.reporting.dto.internal.InventoryItemDTO;
import com.example.reporting.dto.internal.OrderServiceBestsellerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportingService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${order.service.name}")
    private String orderService; // "order-service"

    @Value("${inventory.service.name}")
    private String inventoryService; // "inventory-service"

    /**
     * 1. Logic cho: TạoBáoCáoDoanhThu()
     */
    public RevenueReport generateRevenueReport(LocalDate startDate, LocalDate endDate) {
        
        // Xây dựng URL động với query params
        String url = UriComponentsBuilder.fromHttpUrl("http://" + orderService + "/api/orders/reports/revenue-by-date")
                .queryParam("startDate", startDate.toString())
                .queryParam("endDate", endDate.toString())
                .toUriString();

        // Giả sử OrderService trả về trực tiếp một đối tượng RevenueReport
        try {
            RevenueReport report = restTemplate.getForObject(url, RevenueReport.class);
            return report;
        } catch (Exception e) {
            // Xử lý lỗi nếu OrderService không chạy
            throw new RuntimeException("Không thể lấy báo cáo doanh thu từ OrderService: " + e.getMessage());
        }
    }

    /**
     * 2. Logic cho: LấyDanhSáchHàngBánChạy()
     * (Đây là ví dụ về API Composition)
     */
    public List<BestsellerReportItem> getBestSellingItems(int limit) {
        
        // Bước 1: Gọi OrderService để lấy Top Sản phẩm bán chạy (chỉ có ID và Số lượng)
        String orderUrl = UriComponentsBuilder.fromHttpUrl("http://" + orderService + "/api/orders/reports/bestsellers")
                .queryParam("limit", limit)
                .toUriString();

        OrderServiceBestsellerDTO[] bestsellersFromOrder;
        try {
            bestsellersFromOrder = restTemplate.getForObject(orderUrl, OrderServiceBestsellerDTO[].class);
        } catch (Exception e) {
            throw new RuntimeException("Không thể lấy danh sách bán chạy từ OrderService: " + e.getMessage());
        }

        if (bestsellersFromOrder == null) {
            return List.of(); // Trả về danh sách rỗng
        }

        // Bước 2: Gọi InventoryService để lấy Tên cho từng Sản phẩm
        return Arrays.stream(bestsellersFromOrder)
                .map(item -> {
                    // Gọi InventoryService để lấy tên
                    String inventoryUrl = "http://" + inventoryService + "/api/inventory/items/" + item.getProductId();
                    
                    try {
                        InventoryItemDTO itemDetails = restTemplate.getForObject(inventoryUrl, InventoryItemDTO.class);
                        String productName = (itemDetails != null) ? itemDetails.getName() : "Không rõ tên";
                        
                        return new BestsellerReportItem(
                            item.getProductId(),
                            productName,
                            item.getTotalQuantitySold()
                        );
                    } catch (Exception e) {
                        // Nếu không tìm thấy sản phẩm, vẫn trả về nhưng không có tên
                         return new BestsellerReportItem(
                            item.getProductId(),
                            "Sản phẩm không còn tồn tại",
                            item.getTotalQuantitySold()
                        );
                    }
                })
                .collect(Collectors.toList());
    }
}