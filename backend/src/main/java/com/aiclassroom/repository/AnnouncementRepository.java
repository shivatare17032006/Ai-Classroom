package com.aiclassroom.repository;

import com.aiclassroom.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, String> {
    List<Announcement> findByClassroomIdOrderByCreatedAtDesc(String classroomId);
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
