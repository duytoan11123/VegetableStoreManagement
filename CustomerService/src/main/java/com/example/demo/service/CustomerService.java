package com.example.demo.service;

import com.example.demo.dto.CustomerRequestDTO;
import com.example.demo.dto.CustomerResponseDTO;
import com.example.demo.dto.LoyaltyPointsUpdateDTO;
import com.example.demo.model.Customer;
import com.example.demo.model.Customer.CustomerStatus;
import com.example.demo.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public CustomerResponseDTO createCustomer(CustomerRequestDTO requestDTO) {
        // Check if email already exists
        if (customerRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + requestDTO.getEmail());
        }

        // Generate customer code if not provided
        String customerCode = requestDTO.getCustomerCode();
        if (customerCode == null || customerCode.trim().isEmpty()) {
            customerCode = "KH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else {
            if (customerRepository.existsByCustomerCode(customerCode)) {
                throw new RuntimeException("Customer code already exists: " + customerCode);
            }
        }

        Customer customer = new Customer();
        customer.setCustomerCode(customerCode);
        customer.setFullName(requestDTO.getFullName());
        customer.setEmail(requestDTO.getEmail());
        customer.setPhoneNumber(requestDTO.getPhoneNumber());
        customer.setAddress(requestDTO.getAddress());
        customer.setDateOfBirth(requestDTO.getDateOfBirth());
        customer.setGender(requestDTO.getGender());
        customer.setLoyaltyPoints(0);
        customer.setStatus(CustomerStatus.ACTIVE);

        Customer savedCustomer = customerRepository.save(customer);
        return convertToResponseDTO(savedCustomer);
    }

    @Transactional(readOnly = true)
    public CustomerResponseDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return convertToResponseDTO(customer);
    }

    public CustomerResponseDTO updateCustomer(Long id, CustomerRequestDTO requestDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (!customer.getEmail().equals(requestDTO.getEmail()) && 
            customerRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + requestDTO.getEmail());
        }

        // Check if customer code is being changed and if new code already exists
        if (requestDTO.getCustomerCode() != null && 
            !customer.getCustomerCode().equals(requestDTO.getCustomerCode()) &&
            customerRepository.existsByCustomerCode(requestDTO.getCustomerCode())) {
            throw new RuntimeException("Customer code already exists: " + requestDTO.getCustomerCode());
        }

        customer.setCustomerCode(requestDTO.getCustomerCode() != null ? 
                                 requestDTO.getCustomerCode() : customer.getCustomerCode());
        customer.setFullName(requestDTO.getFullName());
        customer.setEmail(requestDTO.getEmail());
        customer.setPhoneNumber(requestDTO.getPhoneNumber());
        customer.setAddress(requestDTO.getAddress());
        customer.setDateOfBirth(requestDTO.getDateOfBirth());
        customer.setGender(requestDTO.getGender());

        Customer updatedCustomer = customerRepository.save(customer);
        return convertToResponseDTO(updatedCustomer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        customer.setStatus(CustomerStatus.INACTIVE);
        customerRepository.save(customer);
    }

    public CustomerResponseDTO updateLoyaltyPoints(Long id, LoyaltyPointsUpdateDTO updateDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        int newPoints = customer.getLoyaltyPoints() + updateDTO.getPoints();
        if (newPoints < 0) {
            throw new RuntimeException("Loyalty points cannot be negative");
        }

        customer.setLoyaltyPoints(newPoints);
        Customer updatedCustomer = customerRepository.save(customer);
        return convertToResponseDTO(updatedCustomer);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponseDTO> getAllCustomers(CustomerStatus status, Pageable pageable) {
        Page<Customer> customers;
        if (status != null) {
            customers = customerRepository.findByStatus(status, pageable);
        } else {
            customers = customerRepository.findAll(pageable);
        }
        return customers.map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponseDTO> searchCustomers(String keyword, CustomerStatus status, Pageable pageable) {
        Page<Customer> customers = customerRepository.searchCustomers(keyword, status, pageable);
        return customers.map(this::convertToResponseDTO);
    }

    private CustomerResponseDTO convertToResponseDTO(Customer customer) {
        CustomerResponseDTO dto = new CustomerResponseDTO();
        dto.setId(customer.getId());
        dto.setCustomerCode(customer.getCustomerCode());
        dto.setFullName(customer.getFullName());
        dto.setEmail(customer.getEmail());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setAddress(customer.getAddress());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setGender(customer.getGender());
        dto.setLoyaltyPoints(customer.getLoyaltyPoints());
        dto.setStatus(customer.getStatus());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());
        return dto;
    }
}

