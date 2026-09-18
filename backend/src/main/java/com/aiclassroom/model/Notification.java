package com.aiclassroom.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    private String id;
    private String recipientEmail;
    private String recipientRole; // STUDENT, PARENT, TEACHER, ADMIN
    private String studentId;
    private String studentName;
    private String type; // LOW_SCORE_FLAG, PLAGIARISM_ALERT, EXTENSION_GRANTED, ASSIGNMENT_NEW
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String createdAt;
    private Boolean read;

    public Notification() {
    }

    public Notification(String id, String recipientEmail, String recipientRole, String studentId, String studentName, String type, String title, String message, String createdAt, Boolean read) {
        this.id = id;
        this.recipientEmail = recipientEmail;
        this.recipientRole = recipientRole;
        this.studentId = studentId;
        this.studentName = studentName;
        this.type = type;
        this.title = title;
        this.message = message;
        this.createdAt = createdAt;
        this.read = read;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }

    public static NotificationBuilder builder() { return new NotificationBuilder(); }

    public static class NotificationBuilder {
        private String id;
        private String recipientEmail;
        private String recipientRole;
        private String studentId;
        private String studentName;
        private String type;
        private String title;
        private String message;
        private String createdAt;
        private Boolean read;

        public NotificationBuilder id(String id) { this.id = id; return this; }
        public NotificationBuilder recipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; return this; }
        public NotificationBuilder recipientRole(String recipientRole) { this.recipientRole = recipientRole; return this; }
        public NotificationBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public NotificationBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder createdAt(String createdAt) { this.createdAt = createdAt; return this; }
        public NotificationBuilder read(Boolean read) { this.read = read; return this; }

        public Notification build() {
            return new Notification(id, recipientEmail, recipientRole, studentId, studentName, type, title, message, createdAt, read);
        }
    }
}
