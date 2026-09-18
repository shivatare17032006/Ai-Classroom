package com.aiclassroom.controller;

import com.aiclassroom.model.User;
import com.aiclassroom.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email address is required.");
        }

        // Duplicate email validation check
        Optional<User> existingUser = userService.getUserByEmail(user.getEmail().trim());
        if (existingUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("An account with email address '" + user.getEmail() + "' already exists. Please sign in.");
        }

        if (user.getId() == null || user.getId().isEmpty()) {
            String rolePrefix = user.getRole() != null ? user.getRole().substring(0, 1).toLowerCase() : "u";
            user.setId("usr-" + rolePrefix + System.currentTimeMillis());
        }
        user.setEmail(user.getEmail().trim());

        User saved = userService.saveUser(user);
        return ResponseEntity.ok(saved);
    }
}
