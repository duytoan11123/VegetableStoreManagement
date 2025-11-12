package com.example.demo.service;

import com.example.demo.dto.CreateCustomerRequest;
import com.example.demo.model.Customer;
import com.example.demo.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    /**
     * 1. Logic cho: ThêmKháchHàng()
     */
    @Transactional
    public Customer addCustomer(CreateCustomerRequest request) {
        // Kiểm tra email trùng lặp
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email " + request.getEmail() + " đã được sử dụng.");
        }

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setLoyaltyPoints(0); // Bắt đầu với 0 điểm

        return customerRepository.save(customer);
    }

    /**
     * 2. Logic cho: LấyThôngTinKháchHàng()
     */
    public Customer getCustomerInfo(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));
    }

    /**
     * 3. Logic cho: CậpNhậtĐiểmTíchLũy()
     */
    @Transactional
    public Customer updateLoyaltyPoints(Long customerId, int pointsToAdd) {
        Customer customer = getCustomerInfo(customerId); // Tái sử dụng hàm get

        int currentPoints = customer.getLoyaltyPoints();
        customer.setLoyaltyPoints(currentPoints + pointsToAdd);

        return customerRepository.save(customer);
    }
}