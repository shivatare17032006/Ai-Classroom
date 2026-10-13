package com.aiclassroom.service;

import com.aiclassroom.model.Notification;
import com.aiclassroom.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getNotificationsByEmail(String email) {
        return notificationRepository.findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    public List<Notification> getNotificationsByStudent(String studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Notification> getNotificationsForUser(String userId, String email, String role) {
        List<Notification> all = notificationRepository.findAllByOrderByCreatedAtDesc();
        if (all == null || all.isEmpty()) return java.util.Collections.emptyList();

        final String cleanEmail = (email != null) ? email.trim().toLowerCase() : null;
        final String cleanRole = (role != null) ? role.trim().toUpperCase() : null;

        return all.stream().filter(n -> {
            if (n == null) return false;

            // Never show PARENT notifications to teachers or students on their portal notification bell
            if ("TEACHER".equalsIgnoreCase(cleanRole) || "STUDENT".equalsIgnoreCase(cleanRole)) {
                if ("PARENT".equalsIgnoreCase(n.getRecipientRole())) {
                    return false;
                }
            }

            // Role isolation
            if (cleanRole != null && n.getRecipientRole() != null && !n.getRecipientRole().isEmpty()) {
                if (!cleanRole.equalsIgnoreCase(n.getRecipientRole())) {
                    return false;
                }
            }

            // Individual recipient matching
            boolean idMatch = (userId != null && !userId.isEmpty() && userId.equals(n.getRecipientId()));
            boolean emailMatch = (cleanEmail != null && !cleanEmail.isEmpty() && n.getRecipientEmail() != null && cleanEmail.equalsIgnoreCase(n.getRecipientEmail().trim()));
            boolean studentMatch = ("STUDENT".equalsIgnoreCase(cleanRole) && userId != null && userId.equals(n.getStudentId()));

            return idMatch || emailMatch || studentMatch;
        }).collect(java.util.stream.Collectors.toList());
    }

    public Notification sendNotification(Notification notif) {
        if (notif.getId() == null || notif.getId().isEmpty()) {
            notif.setId("notif-" + System.currentTimeMillis());
        }
        if (notif.getCreatedAt() == null || notif.getCreatedAt().isEmpty()) {
            notif.setCreatedAt(LocalDateTime.now().toString());
        }
        if (notif.getRead() == null) {
            notif.setRead(false);
        }
        return notificationRepository.save(notif);
    }

    public Optional<Notification> markAsRead(String id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification notif = notifOpt.get();
            notif.setRead(true);
            return Optional.of(notificationRepository.save(notif));
        }
        return Optional.empty();
    }
}
