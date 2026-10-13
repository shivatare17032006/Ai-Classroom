package com.aiclassroom.controller;

import com.aiclassroom.model.Notification;
import com.aiclassroom.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String role,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail) {
        
        String effectiveEmail = (email != null && !email.trim().isEmpty()) ? email.trim() : headerEmail;

        if ((effectiveEmail != null && !effectiveEmail.isEmpty()) || (userId != null && !userId.isEmpty())) {
            return ResponseEntity.ok(notificationService.getNotificationsForUser(userId, effectiveEmail, role));
        }
        if (studentId != null && !studentId.isEmpty()) {
            return ResponseEntity.ok(notificationService.getNotificationsByStudent(studentId));
        }
        if ("ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(notificationService.getAllNotifications());
        }
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    @PostMapping
    public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.sendNotification(notification));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return notificationService.markAsRead(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
