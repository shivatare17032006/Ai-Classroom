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
            @RequestParam(required = false) String studentId) {
        if (email != null && !email.isEmpty()) {
            return ResponseEntity.ok(notificationService.getNotificationsByEmail(email));
        }
        if (studentId != null && !studentId.isEmpty()) {
            return ResponseEntity.ok(notificationService.getNotificationsByStudent(studentId));
        }
        return ResponseEntity.ok(notificationService.getAllNotifications());
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
