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
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public List<Notification> getNotificationsByStudent(String studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
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
