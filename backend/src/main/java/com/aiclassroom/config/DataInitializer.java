package com.aiclassroom.config;

import com.aiclassroom.model.InstitutionLicense;
import com.aiclassroom.model.SystemConfig;
import com.aiclassroom.model.User;
import com.aiclassroom.repository.InstitutionLicenseRepository;
import com.aiclassroom.repository.SystemConfigRepository;
import com.aiclassroom.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final SystemConfigRepository configRepository;
    private final UserRepository userRepository;
    private final InstitutionLicenseRepository licenseRepository;

    public DataInitializer(SystemConfigRepository configRepository, UserRepository userRepository, InstitutionLicenseRepository licenseRepository) {
        this.configRepository = configRepository;
        this.userRepository = userRepository;
        this.licenseRepository = licenseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize default System Admin account if absent
        if (userRepository.findByEmail("admin@classroom.edu").isEmpty()) {
            User admin = User.builder()
                    .id("usr-admin")
                    .name("System Administrator")
                    .email("admin@classroom.edu")
                    .role("ADMIN")
                    .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                    .build();
            userRepository.save(admin);
        }

        // Initialize sample B2B Institutional Subscriptions if empty
        if (licenseRepository.findAll().isEmpty()) {
            licenseRepository.save(InstitutionLicense.builder()
                    .id("lic-vit")
                    .institutionName("Vishwakarma Institute of Technology (VIT Pune)")
                    .domainExtension("vit.edu")
                    .planType("ENTERPRISE_ANNUAL")
                    .priceInInr(49999.0)
                    .status("ACTIVE")
                    .aiServicesAllowed(true)
                    .createdAt(LocalDateTime.now())
                    .build());

            licenseRepository.save(InstitutionLicense.builder()
                    .id("lic-iitb")
                    .institutionName("IIT Bombay (Indian Institute of Technology)")
                    .domainExtension("iitb.ac.in")
                    .planType("ENTERPRISE_ANNUAL")
                    .priceInInr(99999.0)
                    .status("ACTIVE")
                    .aiServicesAllowed(true)
                    .createdAt(LocalDateTime.now())
                    .build());

            licenseRepository.save(InstitutionLicense.builder()
                    .id("lic-coep")
                    .institutionName("COEP Technological University")
                    .domainExtension("coep.edu.in")
                    .planType("ENTERPRISE_ANNUAL")
                    .priceInInr(49999.0)
                    .status("ACTIVE")
                    .aiServicesAllowed(true)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        // Initialize system config if not present
        List<SystemConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) {
            SystemConfig config = SystemConfig.builder()
                    .id("config-1")
                    .globalDefaultSimilarityThreshold(15.0)
                    .autoEmailParents(true)
                    .aiModelProvider("Gemini 3.5 Pro")
                    .systemVersion("v1.4.0-PROD")
                    .build();
            configRepository.save(config);
        }
    }
}
