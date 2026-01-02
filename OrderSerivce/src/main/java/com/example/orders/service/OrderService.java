package com.example.orders.service;

import com.example.orders.dto.*;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.example.orders.model.Order;
import com.example.orders.model.OrderItem;
import com.example.orders.model.OrderStatus;
import com.example.orders.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
@Service
public class OrderService {
	private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
	@Autowired
    private OrderRepository orderRepository;
	
    @Autowired
    private RestTemplate restTemplate; 

    @Value("${inventory.service.name}")
    private String inventoryService;
    @Value("${payment.service.name}")
    private String paymentService;
    @Value("${customer.service.name}")      
    private String customerService;
    
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
    	Order order = new Order();
        order.setStatus(OrderStatus.PENDING); 
        order.setPaymentMethod(request.getPaymentMethod());
        order.setTotalPrice(request.getTotalPrice());
        order.setCustomerId(request.getCustomerId());
        order.setOrderDate(LocalDateTime.now());
       
        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = order.getTotalPrice();
        // --- Kiểm tra kho và tính tiền ---
        for (OrderItemRequest itemRequest : request.getItems()) {
            InventoryItemResponse itemDetails = getItemDetailsFromInventory(itemRequest.getProductId());
            
            if (itemDetails.getQuantity() < itemRequest.getQuantity()) {
                 throw new RuntimeException("Sản phẩm '" + itemDetails.getName() + "' không đủ hàng.");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProductName(itemDetails.getName());
            orderItem.setProductId(itemRequest.getProductId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPricePerUnit(itemDetails.getPrice());
            orderItem.setOrder(order);
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        // Lưu đơn hàng PENDING vào CSDL để lấy Order ID
        Order savedOrder = orderRepository.save(order);
        
        // ---Gọi PAYMENT SERVICE ---
        
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(savedOrder.getId());
        paymentRequest.setTotalPrice(totalPrice);
        paymentRequest.setPaymentMethod(request.getPaymentMethod()); 

        try {
            String paymentUrl = "http://" + paymentService + "/api/payments/process";
            restTemplate.postForObject(paymentUrl, paymentRequest, PaymentResponse.class);
            
            // Nếu không ném lỗi, nghĩa là thanh toán thành công
            
        } catch (Exception e) {
            // Thanh toán thất bại
            savedOrder.setStatus(OrderStatus.FAILED);
            orderRepository.save(savedOrder);
            throw new RuntimeException("Thanh toán thất bại: " + e.getMessage());
        }

        // --- Gọi INVENTORY SERVICE (Trừ kho) ---
        
        try {
            for (OrderItem item : savedOrder.getItems()) {
                // Lấy tồn kho hiện tại
                InventoryItemResponse currentItemDetails = getItemDetailsFromInventory(item.getProductId());
                
                int newStock = currentItemDetails.getQuantity() - item.getQuantity();

                UpdateStockRequest updateStockRequest = new UpdateStockRequest();
                updateStockRequest.setNewQuantity(newStock);

                String inventoryUrl = "http://" + inventoryService + "/api/inventory/items/" + item.getProductId()+"/stock";
                restTemplate.put(inventoryUrl, updateStockRequest);
            }
            
        } catch (Exception e) {
            try {
                String refundUrl = "http://" + paymentService + "/api/payments/refund";
                restTemplate.postForObject(refundUrl, new RefundRequest(savedOrder.getId()), PaymentResponse.class);
            } catch (Exception refundException) {
                System.out.println(refundException.getMessage());
                savedOrder.setStatus(OrderStatus.FAILED); // Hoặc 1 status đặc biệt
                orderRepository.save(savedOrder);
                throw new RuntimeException("Trừ kho thất bại VÀ hoàn tiền tự động thất bại. Cần can thiệp thủ công cho Order ID: " + savedOrder.getId());
            }

            savedOrder.setStatus(OrderStatus.CANCELLED); // Vì trừ kho thất bại
            orderRepository.save(savedOrder);
            throw new RuntimeException("Trừ kho thất bại, đã tự động hoàn tiền: " + e.getMessage());
        }

        // --- THÀNH CÔNG ---
        // Mọi thứ thành công (Payment OK, Inventory OK)
        savedOrder.setStatus(OrderStatus.PAID); // Đổi từ PENDING sang PAID
        
     // --- GỌI CUSTOMER SERVICE (Cộng điểm) ---
        if (savedOrder.getCustomerId() != null && totalPrice >= 10000) {
            int pointsToAdd = (int) (totalPrice / 10000);
            // Gói DTO (UpdatePointsRequest phải được tạo trong project này)
            UpdatePointsRequest pointsRequest = new UpdatePointsRequest();
            pointsRequest.setPointsToAdd(pointsToAdd);
            pointsRequest.setId(savedOrder.getCustomerId());
            try {
                String pointsUrl = "http://" + customerService + "/api/customers/" + savedOrder.getCustomerId() + "/points";
                restTemplate.put(pointsUrl, pointsRequest);
                
                logger.info("Đã cộng {} điểm cho khách hàng ID: {}", pointsToAdd, savedOrder.getCustomerId());

            } catch (Exception e) {
                // Chỉ ghi log, không ném lỗi
                logger.error(
                    "ĐƠN HÀNG THÀNH CÔNG (ID: {}) NHƯNG CỘNG ĐIỂM THẤT BẠI cho khách hàng ID: {}. Lỗi: {}",
                    savedOrder.getId(),
                    savedOrder.getCustomerId(),
                    e.getMessage()
                );
            }
        }
        return orderRepository.save(savedOrder);
    }
    

    /**
     * 2. Logic cho: CậpNhậtTrạngTháiĐơn()
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = findOrderById(orderId);

        // Logic nghiệp vụ: Nếu hủy đơn, trả hàng VÀ hoàn tiền
        if (newStatus == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            
            // 1. Trả hàng về kho
            for (OrderItem item : order.getItems()) {
                try {
                    InventoryItemResponse currentItemDetails = getItemDetailsFromInventory(item.getProductId());
                    int newStock = currentItemDetails.getQuantity() + item.getQuantity();
                    UpdateStockRequest updateStockRequest = new UpdateStockRequest();
                    updateStockRequest.setNewQuantity(newStock);
                    
                    String inventoryUrl = "http://" + inventoryService + "/api/inventory/items/" + item.getProductId() + "/stock";
                    restTemplate.put(inventoryUrl, updateStockRequest);
                } catch (Exception e) {
                    System.err.println("Lỗi khi trả hàng về kho cho Order ID: " + orderId);
                    // (Không dừng lại, vẫn phải hoàn tiền)
                }
            }

            // 2. Hoàn tiền
            try {
                if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.SHIPPED) {
                    String refundUrl = "http://" + paymentService + "/api/payments/refund";
                    restTemplate.postForObject(refundUrl, new RefundRequest(order.getId()), PaymentResponse.class);
                }
            } catch (Exception e) {
                 // Lỗi nghiêm trọng: Không thể hoàn tiền tự động khi hủy đơn
                throw new RuntimeException("Hủy đơn thất bại: Không thể xử lý hoàn tiền cho Order ID: " + orderId);
            }
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
    
    /**
     * (Bonus) Hàm xem chi tiết đơn hàng
     */
    public Order getOrderDetails(Long orderId) {
        return findOrderById(orderId);
    }
    
    // --- Các hàm hỗ trợ (private) ---

    // Hàm private để lấy chi tiết sản phẩm từ InventoryService
    private InventoryItemResponse getItemDetailsFromInventory(Long productId) {
        try {
            String url = "http://" + inventoryService + "/api/inventory/items/" + productId;
            InventoryItemResponse itemDetails = restTemplate.getForObject(url, InventoryItemResponse.class);
            if (itemDetails == null) {
                 throw new RuntimeException("Không nhận được dữ liệu hợp lệ từ InventoryService cho sản phẩm ID: " + productId);
            }
            return itemDetails;
        } catch (HttpClientErrorException.NotFound e) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm (inventory) với ID: " + productId);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi InventoryService: " + e.getMessage(), e);
        }
    }
    
    // Hàm private để tìm đơn hàng
    private Order findOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng ID: " + orderId));
    }
    
    public RevenueReport generateRevenueReport(LocalDate startDate, LocalDate endDate) {
        // Chuyển LocalDate thành LocalDateTime (từ đầu ngày đến cuối ngày)
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        Double revenue = orderRepository.getRevenueBetweenDates(startDateTime, endDateTime);
        
        return new RevenueReport(revenue, startDate, endDate);
    }
    
    public List<BestsellerDTO> getBestSellingItems(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return orderRepository.findBestsellers(pageable);
    }

    public List<DailyRevenueDTO> getRevenueChartData(int days) {
        LocalDateTime startDate = LocalDate.now().minusDays(days - 1).atStartOfDay();
        List<DailyRevenueProjection> rawData = orderRepository.getDailyRevenueSince(startDate);
        
        //Chuyển List Projection thành Map để tra cứu nhanh
        // Key: LocalDate, Value: Double
        Map<LocalDate, Double> revenueMap = rawData.stream()
            .collect(Collectors.toMap(
                DailyRevenueProjection::getDate, 
                // Kiểm tra null an toàn
                projection -> projection.getRevenue() != null ? projection.getRevenue() : 0.0
            ));
        
        // Tạo danh sách DTO đầy đủ (lấp đầy các ngày trống bằng 0)
        List<DailyRevenueDTO> fullData = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            // Chạy từ ngày cũ nhất đến hôm nay
            LocalDate date = LocalDate.now().minusDays(days - 1 - i);
            
            // Lấy doanh thu từ Map, nếu không có thì mặc định là 0.0
            Double revenue = revenueMap.getOrDefault(date, 0.0);
            
            fullData.add(new DailyRevenueDTO(date, revenue));
        }
        
        return fullData;
    }
    
    public OrderGrowthDTO getOrderGrowthMetric() {
        // Xác định thời gian Hôm nay
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        // Xác định thời gian Hôm qua
        LocalDateTime startOfYesterday = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime endOfYesterday = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);

        // Gọi Repository để đếm
        long todayCount = orderRepository.countOrdersBetween(startOfToday, endOfToday);
        long yesterdayCount = orderRepository.countOrdersBetween(startOfYesterday, endOfYesterday);

        // Tính tỷ lệ tăng trưởng (%)
        double growthRate = 0.0;
        
        if (yesterdayCount > 0) {
            growthRate = ((double) (todayCount - yesterdayCount) / yesterdayCount) * 100;
        } else if (todayCount > 0) {
            growthRate = 100.0;
        }


        return new OrderGrowthDTO(todayCount, growthRate);
    }
    

    /**
     * Tính doanh thu tháng này và tăng trưởng so với tháng trước
     */
    public MonthlyRevenueDTO getMonthlyRevenueMetric() {
        //  Xác định thời gian Tháng Này
        LocalDateTime startOfThisMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfThisMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);

        // Xác định thời gian Tháng Trước
        LocalDateTime startOfLastMonth = LocalDate.now().minusMonths(1).with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfLastMonth = LocalDate.now().minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);

        // Doanh thu 2 tháng
        Double thisMonthRev = orderRepository.getRevenueBetweenDates(startOfThisMonth, endOfThisMonth);
        Double lastMonthRev = orderRepository.getRevenueBetweenDates(startOfLastMonth, endOfLastMonth);

        // Xử lý null
        if (thisMonthRev == null) thisMonthRev = 0.0;
        if (lastMonthRev == null) lastMonthRev = 0.0;

        //  Tính tăng trưởng
        double growthRate = 0.0;
        if (lastMonthRev > 0) {
            growthRate = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
        } else if (thisMonthRev > 0) {
            growthRate = 100.0; // Tăng trưởng tuyệt đối nếu tháng trước = 0
        }

        return new MonthlyRevenueDTO(thisMonthRev, growthRate);
    }
    
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
    
    /**
     * Lấy danh sách đơn hàng có hỗ trợ lọc theo ngày
     */
    public Page<Order> getAllOrders(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        if (startDate != null && endDate != null) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            return orderRepository.findAllByOrderDateBetween(startDateTime, endDateTime, pageable);
        }
        return orderRepository.findAll(pageable);
    }
}