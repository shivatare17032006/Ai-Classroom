package com.aiclassroom.controller;

import com.aiclassroom.model.InstitutionLicense;
import com.aiclassroom.repository.InstitutionLicenseRepository;
import com.aiclassroom.service.EmailService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    private final EmailService emailService;

    public InstitutionLicenseController(InstitutionLicenseRepository licenseRepository, EmailService emailService) {
        this.licenseRepository = licenseRepository;
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<List<InstitutionLicense>> getAllLicenses() {
        List<InstitutionLicense> list = licenseRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (InstitutionLicense lic : list) {
            if ("ACTIVE".equalsIgnoreCase(lic.getStatus()) && lic.getExpiresAt() != null && now.isAfter(lic.getExpiresAt())) {
                lic.setStatus("EXPIRED");
                lic.setAiServicesAllowed(false);
                licenseRepository.save(lic);
            }
        }
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> clearAllLicenses() {
        licenseRepository.deleteAll();
        return ResponseEntity.ok("All institutional licenses cleared.");
    }

    @PostMapping
    @CacheEvict(value = "licenses", allEntries = true)
    public ResponseEntity<?> createLicense(@RequestBody InstitutionLicense license) {
        if (license.getDomainExtension() == null || license.getDomainExtension().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Domain extension (e.g. vit.edu) is required.");
        }

        String cleanDomain = license.getDomainExtension().trim().toLowerCase().replace("@", "");
        Optional<InstitutionLicense> existingOpt = licenseRepository.findByDomainExtension(cleanDomain);

        InstitutionLicense licenseToSave;
        if (existingOpt.isPresent()) {
            InstitutionLicense existing = existingOpt.get();
            if ("ACTIVE".equalsIgnoreCase(existing.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("An active whitelisted campus license for domain '" + cleanDomain + "' already exists.");
            }
            // Update existing pending/rejected record with newly submitted proof document & details
            licenseToSave = existing;
            if (license.getInstitutionName() != null && !license.getInstitutionName().trim().isEmpty()) {
                licenseToSave.setInstitutionName(license.getInstitutionName());
            }
            if (license.getPlanType() != null) {
                licenseToSave.setPlanType(license.getPlanType());
            }
            if (license.getPriceInInr() != null) {
                licenseToSave.setPriceInInr(license.getPriceInInr());
            }
            if (license.getContactName() != null && !license.getContactName().trim().isEmpty()) {
                licenseToSave.setContactName(license.getContactName());
            }
            if (license.getContactEmail() != null && !license.getContactEmail().trim().isEmpty()) {
                licenseToSave.setContactEmail(license.getContactEmail());
            }
            if (license.getProofDocumentName() != null && !license.getProofDocumentName().trim().isEmpty()) {
                licenseToSave.setProofDocumentName(license.getProofDocumentName());
            }
            if (license.getProofDocumentUrl() != null && !license.getProofDocumentUrl().trim().isEmpty()) {
                licenseToSave.setProofDocumentUrl(license.getProofDocumentUrl());
            }
            licenseToSave.setStatus("PENDING_VERIFICATION");
            licenseToSave.setAiServicesAllowed(false);
            licenseToSave.setCreatedAt(LocalDateTime.now());
        } else {
            licenseToSave = license;
            licenseToSave.setId("lic-" + UUID.randomUUID().toString().substring(0, 8));
            licenseToSave.setDomainExtension(cleanDomain);
            if (licenseToSave.getCreatedAt() == null) {
                licenseToSave.setCreatedAt(LocalDateTime.now());
            }
            if (licenseToSave.getStatus() == null) {
                licenseToSave.setStatus("PENDING_VERIFICATION");
            }
            if ("ACTIVE".equalsIgnoreCase(licenseToSave.getStatus())) {
                licenseToSave.setAiServicesAllowed(true);
                licenseToSave.setApprovedAt(LocalDateTime.now());
                licenseToSave.setExpiresAt(LocalDateTime.now().plusYears(1));
            } else {
                licenseToSave.setAiServicesAllowed(false);
            }
        }

        InstitutionLicense saved = licenseRepository.save(licenseToSave);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveLicense(@PathVariable String id) {
        Optional<InstitutionLicense> licenseOpt = licenseRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        InstitutionLicense license = licenseOpt.get();
        license.setStatus("ACTIVE");
        license.setAiServicesAllowed(true);
        license.setApprovedAt(LocalDateTime.now());
        license.setExpiresAt(LocalDateTime.now().plusYears(1)); // Valid for 1 Year (365 days)

        InstitutionLicense updated = licenseRepository.save(license);

        // TRIGGER AUTOMATED B2B APPROVAL EMAIL TO INSTITUTION CONTACT
        if (license.getContactEmail() != null && !license.getContactEmail().trim().isEmpty()) {
            emailService.sendInstitutionalApprovalNotification(
                license.getContactEmail(),
                license.getContactName() != null ? license.getContactName() : "Institution Manager",
                license.getInstitutionName(),
                license.getDomainExtension()
            );
        }

        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectLicense(@PathVariable String id) {
        Optional<InstitutionLicense> licenseOpt = licenseRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        InstitutionLicense license = licenseOpt.get();
        license.setStatus("REJECTED");
        license.setAiServicesAllowed(false);

        InstitutionLicense updated = licenseRepository.save(license);
        return ResponseEntity.ok(updated);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLicense(@PathVariable String id) {
        Optional<InstitutionLicense> licenseOpt = licenseRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        licenseRepository.deleteById(id);
        return ResponseEntity.ok("License " + id + " removed successfully.");
    }
}
