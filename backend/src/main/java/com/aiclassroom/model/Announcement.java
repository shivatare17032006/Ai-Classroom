package com.aiclassroom.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    private String id;

    private String classroomId;
    private String authorId;
    private String authorName;
    private String authorRole;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    public Announcement() {
    }

    public Announcement(String id, String classroomId, String authorId, String authorName, String authorRole, String content, LocalDateTime createdAt) {
        this.id = id;
        this.classroomId = classroomId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorRole = authorRole;
        this.content = content;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClassroomId() { return classroomId; }
    public void setClassroomId(String classroomId) { this.classroomId = classroomId; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static AnnouncementBuilder builder() { return new AnnouncementBuilder(); }

    public static class AnnouncementBuilder {
        private String id;
        private String classroomId;
        private String authorId;
        private String authorName;
        private String authorRole;
        private String content;
        private LocalDateTime createdAt;

        public AnnouncementBuilder id(String id) { this.id = id; return this; }
        public AnnouncementBuilder classroomId(String classroomId) { this.classroomId = classroomId; return this; }
        public AnnouncementBuilder authorId(String authorId) { this.authorId = authorId; return this; }
        public AnnouncementBuilder authorName(String authorName) { this.authorName = authorName; return this; }
        public AnnouncementBuilder authorRole(String authorRole) { this.authorRole = authorRole; return this; }
        public AnnouncementBuilder content(String content) { this.content = content; return this; }
        public AnnouncementBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Announcement build() {
            return new Announcement(id, classroomId, authorId, authorName, authorRole, content, createdAt);
        }
    }
}
