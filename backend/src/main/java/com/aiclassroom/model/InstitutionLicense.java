package com.aiclassroom.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "institution_licenses")
public class InstitutionLicense {
    @Id
    private String id;

    private String institutionName;

    @Column(unique = true)
    private String domainExtension; // e.g. vit.edu, iitb.ac.in

    private String planType; // ENTERPRISE_ANNUAL, PRO_TEACHER
    private Double priceInInr; // e.g. 49999.0
    private String status; // ACTIVE, SUSPENDED, PENDING_VERIFICATION
    private Boolean aiServicesAllowed;
    private LocalDateTime createdAt;

    public InstitutionLicense() {
    }

    public InstitutionLicense(String id, String institutionName, String domainExtension, String planType, Double priceInInr, String status, Boolean aiServicesAllowed, LocalDateTime createdAt) {
        this.id = id;
        this.institutionName = institutionName;
        this.domainExtension = domainExtension;
        this.planType = planType;
        this.priceInInr = priceInInr;
        this.status = status != null ? status : "ACTIVE";
        this.aiServicesAllowed = aiServicesAllowed != null ? aiServicesAllowed : true;
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static InstitutionLicenseBuilder builder() { return new InstitutionLicenseBuilder(); }

    public static class InstitutionLicenseBuilder {
        private String id;
        private String institutionName;
        private String domainExtension;
        private String planType;
        private Double priceInInr;
        private String status;
        private Boolean aiServicesAllowed;
        private LocalDateTime createdAt;

        public InstitutionLicenseBuilder id(String id) { this.id = id; return this; }
        public InstitutionLicenseBuilder institutionName(String institutionName) { this.institutionName = institutionName; return this; }
        public InstitutionLicenseBuilder domainExtension(String domainExtension) { this.domainExtension = domainExtension; return this; }
        public InstitutionLicenseBuilder planType(String planType) { this.planType = planType; return this; }
        public InstitutionLicenseBuilder priceInInr(Double priceInInr) { this.priceInInr = priceInInr; return this; }
        public InstitutionLicenseBuilder status(String status) { this.status = status; return this; }
        public InstitutionLicenseBuilder aiServicesAllowed(Boolean aiServicesAllowed) { this.aiServicesAllowed = aiServicesAllowed; return this; }
        public InstitutionLicenseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public InstitutionLicense build() {
            return new InstitutionLicense(id, institutionName, domainExtension, planType, priceInInr, status, aiServicesAllowed, createdAt);
        }
    }
}
