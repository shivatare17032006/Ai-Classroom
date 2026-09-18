package com.aiclassroom.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;
    private String name;

    @Column(unique = true)
    private String email;
    private String role; // TEACHER, STUDENT, PARENT, ADMIN
    private String parentEmail;
    private String avatar;

    public User() {
    }

    public User(String id, String name, String email, String role, String parentEmail, String avatar) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.parentEmail = parentEmail;
        this.avatar = avatar;
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

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private String id;
        private String name;
        private String email;
        private String role;
        private String parentEmail;
        private String avatar;

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder parentEmail(String parentEmail) { this.parentEmail = parentEmail; return this; }
        public UserBuilder avatar(String avatar) { this.avatar = avatar; return this; }

        public User build() {
            return new User(id, name, email, role, parentEmail, avatar);
        }
    }
}
