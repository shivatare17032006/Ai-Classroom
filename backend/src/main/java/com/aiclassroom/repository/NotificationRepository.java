package com.aiclassroom.repository;

import com.aiclassroom.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    List<Notification> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
