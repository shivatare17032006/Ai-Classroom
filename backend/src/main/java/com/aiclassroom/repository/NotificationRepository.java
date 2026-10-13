package com.aiclassroom.repository;

import com.aiclassroom.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    List<Notification> findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(String recipientEmail);
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);
    List<Notification> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
