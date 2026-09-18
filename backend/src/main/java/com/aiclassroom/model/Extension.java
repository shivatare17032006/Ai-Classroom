package com.aiclassroom.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "extensions")
public class Extension {
    @Id
    private String id;
    private String assignmentId;
    private String studentId;
    private String studentName;
    private String originalDueDate;
    private String extendedDueDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private String status; // APPROVED, PENDING, REJECTED
    private String approvedAt;

    public Extension() {
    }

    public Extension(String id, String assignmentId, String studentId, String studentName, String originalDueDate, String extendedDueDate, String reason, String status, String approvedAt) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.originalDueDate = originalDueDate;
        this.extendedDueDate = extendedDueDate;
        this.reason = reason;
        this.status = status;
        this.approvedAt = approvedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getOriginalDueDate() { return originalDueDate; }
    public void setOriginalDueDate(String originalDueDate) { this.originalDueDate = originalDueDate; }

    public String getExtendedDueDate() { return extendedDueDate; }
    public void setExtendedDueDate(String extendedDueDate) { this.extendedDueDate = extendedDueDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

    public static ExtensionBuilder builder() { return new ExtensionBuilder(); }

    public static class ExtensionBuilder {
        private String id;
        private String assignmentId;
        private String studentId;
        private String studentName;
        private String originalDueDate;
        private String extendedDueDate;
        private String reason;
        private String status;
        private String approvedAt;

        public ExtensionBuilder id(String id) { this.id = id; return this; }
        public ExtensionBuilder assignmentId(String assignmentId) { this.assignmentId = assignmentId; return this; }
        public ExtensionBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public ExtensionBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public ExtensionBuilder originalDueDate(String originalDueDate) { this.originalDueDate = originalDueDate; return this; }
        public ExtensionBuilder extendedDueDate(String extendedDueDate) { this.extendedDueDate = extendedDueDate; return this; }
        public ExtensionBuilder reason(String reason) { this.reason = reason; return this; }
        public ExtensionBuilder status(String status) { this.status = status; return this; }
        public ExtensionBuilder approvedAt(String approvedAt) { this.approvedAt = approvedAt; return this; }

        public Extension build() {
            return new Extension(id, assignmentId, studentId, studentName, originalDueDate, extendedDueDate, reason, status, approvedAt);
        }
    }
}
