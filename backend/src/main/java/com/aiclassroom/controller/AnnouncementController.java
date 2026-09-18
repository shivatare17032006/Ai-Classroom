package com.aiclassroom.controller;

import com.aiclassroom.model.Announcement;
import com.aiclassroom.repository.AnnouncementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @GetMapping
    public ResponseEntity<List<Announcement>> getAnnouncements(@RequestParam(required = false) String classroomId) {
        if (classroomId != null && !classroomId.trim().isEmpty()) {
            return ResponseEntity.ok(announcementRepository.findByClassroomIdOrderByCreatedAtDesc(classroomId));
        }
        return ResponseEntity.ok(announcementRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        if (announcement.getId() == null || announcement.getId().trim().isEmpty()) {
            announcement.setId("ann-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (announcement.getCreatedAt() == null) {
            announcement.setCreatedAt(LocalDateTime.now());
        }
        Announcement saved = announcementRepository.save(announcement);
        return ResponseEntity.ok(saved);
    }
}
