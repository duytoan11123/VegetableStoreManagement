package com.example.orders.service;

import com.example.orders.dto.*;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    /**
     * 1. Logic cho: TạoĐơnHàng() (bao gồm TínhTổngTiền)
     */
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
    	Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING); // Trạng thái ban đầu
        order.setCustomerId(request.getCustomerId());
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0;

        // --- Kiểm tra kho và tính tiền ---
        for (OrderItemRequest itemRequest : request.getItems()) {
            InventoryItemResponse itemDetails = getItemDetailsFromInventory(itemRequest.getProductId());
            
            if (itemDetails.getQuantity() < itemRequest.getQuantity()) {
                 throw new RuntimeException("Sản phẩm '" + itemDetails.getName() + "' không đủ hàng.");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(itemRequest.getProductId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPriceAtPurchase(itemDetails.getPrice());
            orderItem.setOrder(order);
            orderItems.add(orderItem);

            totalAmount += (itemDetails.getPrice() * itemRequest.getQuantity());
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        // Lưu đơn hàng PENDING vào CSDL để lấy Order ID
        Order savedOrder = orderRepository.save(order);

        // ---Gọi PAYMENT SERVICE ---
        
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(savedOrder.getId());
        paymentRequest.setAmount(totalAmount);
        // (Trong thực tế, token này đến từ frontend)
        paymentRequest.setPaymentToken(request.getPaymentToken()); // 👈 Giả sử CreateOrderRequest có paymentToken

        try {
            String paymentUrl = "http://" + paymentService + "/api/payments/process";
            restTemplate.postForObject(paymentUrl, paymentRequest, PaymentResponse.class);
            
            // Nếu không ném lỗi, nghĩa là thanh toán thành công
            
        } catch (Exception e) {
            // Thanh toán thất bại!
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

                String inventoryUrl = "http://" + inventoryService + "/api/inventory/items/" + item.getProductId() + "/stock";
                restTemplate.put(inventoryUrl, updateStockRequest);
            }
            
        } catch (Exception e) {
            // Trừ kho thất bại!
            // *** HOÀN TIỀN ***
            try {
                String refundUrl = "http://" + paymentService + "/api/payments/refund";
                restTemplate.postForObject(refundUrl, new RefundRequest(savedOrder.getId()), PaymentResponse.class);
            } catch (Exception refundException) {
                // Lỗi nghiêm trọng: Không thể hoàn tiền tự động
                // (Cần hệ thống cảnh báo admin)
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
        savedOrder.setStatus(OrderStatus.PROCESSING); // Đổi từ PENDING sang PROCESSING
        
     // --- GỌI CUSTOMER SERVICE (Cộng điểm) ---
        if (savedOrder.getCustomerId() != null && totalAmount >= 10000) {
            int pointsToAdd = (int) (totalAmount / 10000);
            // Gói DTO (UpdatePointsRequest phải được tạo trong project này)
            UpdatePointsRequest pointsRequest = new UpdatePointsRequest();
            pointsRequest.setPointsToAdd(pointsToAdd);

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
                // Chỉ hoàn tiền nếu đơn hàng đã được thanh toán thành công
                // (Tránh hoàn tiền cho đơn PENDING hoặc FAILED)
                if (order.getStatus() == OrderStatus.PROCESSING || order.getStatus() == OrderStatus.SHIPPED) {
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
    
    public List<BestsellerProjection> getBestSellingItems(int limit) {
        // Dùng PageRequest.of(page, size) để giới hạn kết quả
        // page 0 = trang đầu tiên
        Pageable pageable = PageRequest.of(0, limit);
        
        return orderRepository.findBestsellers(pageable);
    }
}