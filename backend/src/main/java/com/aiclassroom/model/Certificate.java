package com.aiclassroom.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "certificates")
public class Certificate {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String title;
    private String category;
    private String issuer;
    private String issueDate;
    private String credentialUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean verified;

    public Certificate() {
    }

    public Certificate(String id, String studentId, String studentName, String title, String category, String issuer, String issueDate, String credentialUrl, String description, Boolean verified) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.title = title;
        this.category = category;
        this.issuer = issuer;
        this.issueDate = issueDate;
        this.credentialUrl = credentialUrl;
        this.description = description;
        this.verified = verified;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public static CertificateBuilder builder() { return new CertificateBuilder(); }

    public static class CertificateBuilder {
        private String id;
        private String studentId;
        private String studentName;
        private String title;
        private String category;
        private String issuer;
        private String issueDate;
        private String credentialUrl;
        private String description;
        private Boolean verified;

        public CertificateBuilder id(String id) { this.id = id; return this; }
        public CertificateBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public CertificateBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public CertificateBuilder title(String title) { this.title = title; return this; }
        public CertificateBuilder category(String category) { this.category = category; return this; }
        public CertificateBuilder issuer(String issuer) { this.issuer = issuer; return this; }
        public CertificateBuilder issueDate(String issueDate) { this.issueDate = issueDate; return this; }
        public CertificateBuilder credentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; return this; }
        public CertificateBuilder description(String description) { this.description = description; return this; }
        public CertificateBuilder verified(Boolean verified) { this.verified = verified; return this; }

        public Certificate build() {
            return new Certificate(id, studentId, studentName, title, category, issuer, issueDate, credentialUrl, description, verified);
        }
    }
}
