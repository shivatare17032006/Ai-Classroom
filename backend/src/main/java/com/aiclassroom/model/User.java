package com.aiclassroom.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_role", columnList = "role"),
    @Index(name = "idx_user_plan", columnList = "planType")
})
public class User {
    @Id
    private String id;
    private String name;

    @Column(unique = true)
    private String email;
    private String role; // TEACHER, STUDENT, PARENT, ADMIN
    private String parentEmail;
    private String avatar;
    private String rollNo;
    private String prnNo;
    private String planType = "FREE"; // FREE, INDIVIDUAL_PRO, INSTITUTIONAL_ENTERPRISE
    private Integer aiCreditsUsed = 0;

    public User() {
    }

    public User(String id, String name, String email, String role, String parentEmail, String avatar, String rollNo, String prnNo) {
        this(id, name, email, role, parentEmail, avatar, rollNo, prnNo, "FREE", 0);
    }

    public User(String id, String name, String email, String role, String parentEmail, String avatar, String rollNo, String prnNo, String planType) {
        this(id, name, email, role, parentEmail, avatar, rollNo, prnNo, planType, 0);
    }

    public User(String id, String name, String email, String role, String parentEmail, String avatar, String rollNo, String prnNo, String planType, Integer aiCreditsUsed) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.parentEmail = parentEmail;
        this.avatar = avatar;
        this.rollNo = rollNo;
        this.prnNo = prnNo;
        this.planType = planType != null ? planType : "FREE";
        this.aiCreditsUsed = aiCreditsUsed != null ? aiCreditsUsed : 0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getPrnNo() { return prnNo; }
    public void setPrnNo(String prnNo) { this.prnNo = prnNo; }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public Integer getAiCreditsUsed() { return aiCreditsUsed; }
    public void setAiCreditsUsed(Integer aiCreditsUsed) { this.aiCreditsUsed = aiCreditsUsed; }

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private String id;
        private String name;
        private String email;
        private String role;
        private String parentEmail;
        private String avatar;
        private String rollNo;
        private String prnNo;
        private String planType = "FREE";
        private Integer aiCreditsUsed = 0;

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder parentEmail(String parentEmail) { this.parentEmail = parentEmail; return this; }
        public UserBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public UserBuilder rollNo(String rollNo) { this.rollNo = rollNo; return this; }
        public UserBuilder prnNo(String prnNo) { this.prnNo = prnNo; return this; }
        public UserBuilder planType(String planType) { this.planType = planType; return this; }
        public UserBuilder aiCreditsUsed(Integer aiCreditsUsed) { this.aiCreditsUsed = aiCreditsUsed; return this; }

        public User build() {
            return new User(id, name, email, role, parentEmail, avatar, rollNo, prnNo, planType, aiCreditsUsed);
        }
    }
}
