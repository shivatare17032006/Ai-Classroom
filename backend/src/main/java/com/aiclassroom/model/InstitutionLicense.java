package com.aiclassroom.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "institution_licenses", indexes = {
    @Index(name = "idx_lic_domain_ext", columnList = "domainExtension"),
    @Index(name = "idx_lic_status", columnList = "status")
})
public class InstitutionLicense {
    @Id
    private String id;

    private String institutionName;

    @Column(unique = true)
    private String domainExtension; // e.g. vit.edu, iitb.ac.in

    private String planType; // ENTERPRISE_ANNUAL, PRO_TEACHER
    private Double priceInInr; // e.g. 49999.0
    private String status; // ACTIVE, PENDING_VERIFICATION, SUSPENDED, REJECTED
    private Boolean aiServicesAllowed;
    private String contactName;
    private String contactEmail;
    private String proofDocumentName;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String proofDocumentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime expiresAt;

    public InstitutionLicense() {
    }

    public InstitutionLicense(String id, String institutionName, String domainExtension, String planType, Double priceInInr, String status, Boolean aiServicesAllowed, String contactName, String contactEmail, String proofDocumentName, String proofDocumentUrl, LocalDateTime createdAt) {
        this.id = id;
        this.institutionName = institutionName;
        this.domainExtension = domainExtension;
        this.planType = planType;
        this.priceInInr = priceInInr;
        this.status = status != null ? status : "ACTIVE";
        this.aiServicesAllowed = aiServicesAllowed != null ? aiServicesAllowed : true;
        this.contactName = contactName;
        this.contactEmail = contactEmail;
        this.proofDocumentName = proofDocumentName;
        this.proofDocumentUrl = proofDocumentUrl;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getDomainExtension() { return domainExtension; }
    public void setDomainExtension(String domainExtension) { this.domainExtension = domainExtension; }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public Double getPriceInInr() { return priceInInr; }
    public void setPriceInInr(Double priceInInr) { this.priceInInr = priceInInr; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getAiServicesAllowed() { return aiServicesAllowed; }
    public void setAiServicesAllowed(Boolean aiServicesAllowed) { this.aiServicesAllowed = aiServicesAllowed; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getProofDocumentName() { return proofDocumentName; }
    public void setProofDocumentName(String proofDocumentName) { this.proofDocumentName = proofDocumentName; }

    public String getProofDocumentUrl() { return proofDocumentUrl; }
    public void setProofDocumentUrl(String proofDocumentUrl) { this.proofDocumentUrl = proofDocumentUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public static InstitutionLicenseBuilder builder() { return new InstitutionLicenseBuilder(); }

    public static class InstitutionLicenseBuilder {
        private String id;
        private String institutionName;
        private String domainExtension;
        private String planType;
        private Double priceInInr;
        private String status;
        private Boolean aiServicesAllowed;
        private String contactName;
        private String contactEmail;
        private String proofDocumentName;
        private String proofDocumentUrl;
        private LocalDateTime createdAt;

        public InstitutionLicenseBuilder id(String id) { this.id = id; return this; }
        public InstitutionLicenseBuilder institutionName(String institutionName) { this.institutionName = institutionName; return this; }
        public InstitutionLicenseBuilder domainExtension(String domainExtension) { this.domainExtension = domainExtension; return this; }
        public InstitutionLicenseBuilder planType(String planType) { this.planType = planType; return this; }
        public InstitutionLicenseBuilder priceInInr(Double priceInInr) { this.priceInInr = priceInInr; return this; }
        public InstitutionLicenseBuilder status(String status) { this.status = status; return this; }
        public InstitutionLicenseBuilder aiServicesAllowed(Boolean aiServicesAllowed) { this.aiServicesAllowed = aiServicesAllowed; return this; }
        public InstitutionLicenseBuilder contactName(String contactName) { this.contactName = contactName; return this; }
        public InstitutionLicenseBuilder contactEmail(String contactEmail) { this.contactEmail = contactEmail; return this; }
        public InstitutionLicenseBuilder proofDocumentName(String proofDocumentName) { this.proofDocumentName = proofDocumentName; return this; }
        public InstitutionLicenseBuilder proofDocumentUrl(String proofDocumentUrl) { this.proofDocumentUrl = proofDocumentUrl; return this; }
        public InstitutionLicenseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public InstitutionLicense build() {
            return new InstitutionLicense(id, institutionName, domainExtension, planType, priceInInr, status, aiServicesAllowed, contactName, contactEmail, proofDocumentName, proofDocumentUrl, createdAt);
        }
    }
}
