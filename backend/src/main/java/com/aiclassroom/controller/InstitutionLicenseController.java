package com.aiclassroom.controller;

import com.aiclassroom.model.InstitutionLicense;
import com.aiclassroom.repository.InstitutionLicenseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/licenses")
public class InstitutionLicenseController {

    private final InstitutionLicenseRepository licenseRepository;

    public InstitutionLicenseController(InstitutionLicenseRepository licenseRepository) {
        this.licenseRepository = licenseRepository;
    }

    @GetMapping
    public ResponseEntity<List<InstitutionLicense>> getAllLicenses() {
        return ResponseEntity.ok(licenseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createLicense(@RequestBody InstitutionLicense license) {
        if (license.getDomainExtension() == null || license.getDomainExtension().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Domain extension (e.g. vit.edu) is required.");
        }

        String cleanDomain = license.getDomainExtension().trim().toLowerCase().replace("@", "");
        Optional<InstitutionLicense> existing = licenseRepository.findByDomainExtension(cleanDomain);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("An active subscription for domain '" + cleanDomain + "' already exists.");
        }

        license.setId("lic-" + UUID.randomUUID().toString().substring(0, 8));
        license.setDomainExtension(cleanDomain);
        if (license.getCreatedAt() == null) {
            license.setCreatedAt(LocalDateTime.now());
        }
        if (license.getStatus() == null) {
            license.setStatus("ACTIVE");
        }
        if (license.getAiServicesAllowed() == null) {
            license.setAiServicesAllowed(true);
        }

        InstitutionLicense saved = licenseRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleLicenseStatus(@PathVariable String id) {
        Optional<InstitutionLicense> licenseOpt = licenseRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        InstitutionLicense license = licenseOpt.get();
        if ("ACTIVE".equalsIgnoreCase(license.getStatus())) {
            license.setStatus("SUSPENDED");
            license.setAiServicesAllowed(false);
        } else {
            license.setStatus("ACTIVE");
            license.setAiServicesAllowed(true);
        }

        InstitutionLicense updated = licenseRepository.save(license);
        return ResponseEntity.ok(updated);
    }
}
