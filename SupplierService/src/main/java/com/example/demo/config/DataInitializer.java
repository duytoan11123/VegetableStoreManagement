package com.example.demo.config;

import com.example.demo.model.ImportRecord;
import com.example.demo.model.Supplier;
import com.example.demo.repository.ImportRecordRepository;
import com.example.demo.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ImportRecordRepository importRecordRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            if (importRecordRepository.count() == 0) {
                Supplier s = new Supplier();
                s.setName("Nhà cung cấp mẫu");
                s.setContactPerson("Người A");
                s.setEmail("supplier@example.com");
                s.setPhone("0123456789");
                s.setAddress("Hà Nội");
                s.setDescription("Supplier created for local testing");
                Supplier saved = supplierRepository.save(s);

                ImportRecord r1 = new ImportRecord();
                r1.setSupplierId(saved.getId());
                r1.setImportDate(LocalDateTime.parse("2025-12-26T12:00:00"));
                r1.setItems("Cải bó xôi:10kg");
                r1.setTotalAmount(250.0);
                importRecordRepository.save(r1);

                ImportRecord r2 = new ImportRecord();
                r2.setSupplierId(saved.getId());
                r2.setImportDate(LocalDateTime.parse("2025-12-25T09:30:00"));
                r2.setItems("Cà chua:5kg");
                r2.setTotalAmount(120.5);
                importRecordRepository.save(r2);
            }
        } catch (Exception ex) {
            // don't prevent app start; log to stdout
            System.out.println("DataInitializer failed: " + ex.getMessage());
        }
    }
}
