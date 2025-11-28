package com.example.demo.service;

import com.example.demo.model.Customer;
import com.example.demo.dto.CustomerRequestDTO;
import com.example.demo.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers(String search) {
        if (search != null && !search.isEmpty()) {
            return customerRepository.findBySearchTerm(search);
        } else {
            return customerRepository.findAll();
        }
    }

    @Transactional
    public Customer addCustomer(CustomerRequestDTO request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(Long id, CustomerRequestDTO request) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Customer ID: " + id));
        
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy Customer ID: " + id);
        }
        customerRepository.deleteById(id);
    }
    
    @Transactional
    public void addPointsToCustomer(Long id, int pointsToAdd) {
    	 Customer customer = customerRepository.findById(id)
    			 .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Customer ID: " + id));
    	 customer.setLoyaltyPoints(customer.getLoyaltyPoints()+pointsToAdd);
    	 customerRepository.save(customer);
    }
}