package com.aiclassroom.config;

import com.aiclassroom.model.InstitutionLicense;
import com.aiclassroom.model.SystemConfig;
import com.aiclassroom.model.User;
import com.aiclassroom.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final SystemConfigRepository configRepository;
    private final UserRepository userRepository;
    private final InstitutionLicenseRepository licenseRepository;
    private final ClassroomRepository classroomRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final ExtensionRepository extensionRepository;
    private final NotificationRepository notificationRepository;
    private final AnnouncementRepository announcementRepository;
    private final CertificateRepository certificateRepository;

    public DataInitializer(
            SystemConfigRepository configRepository,
            UserRepository userRepository,
            InstitutionLicenseRepository licenseRepository,
            ClassroomRepository classroomRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            ExtensionRepository extensionRepository,
            NotificationRepository notificationRepository,
            AnnouncementRepository announcementRepository,
            CertificateRepository certificateRepository) {
        this.configRepository = configRepository;
        this.userRepository = userRepository;
        this.licenseRepository = licenseRepository;
        this.classroomRepository = classroomRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.extensionRepository = extensionRepository;
        this.notificationRepository = notificationRepository;
        this.announcementRepository = announcementRepository;
        this.certificateRepository = certificateRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Preserve all registered students, teachers, classrooms, assignments, submissions & licenses permanently.
        // DO NOT delete existing users or operational data on startup.

        // Ensure default System Admin account exists if not present
        if (userRepository.findByEmail("admin@classroom.edu").isEmpty()) {
            User admin = User.builder()
                    .id("usr-admin")
                    .name("System Administrator")
                    .email("admin@classroom.edu")
                    .role("ADMIN")
                    .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                    .build();
            userRepository.save(admin);
        }

        // Initialize default system config if not present
        List<SystemConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) {
            SystemConfig config = SystemConfig.builder()
                    .id("config-1")
                    .globalDefaultSimilarityThreshold(15.0)
                    .autoEmailParents(true)
                    .aiModelProvider("Gemini 1.5 Pro")
                    .systemVersion("v1.4.0-PROD")
                    .build();
            configRepository.save(config);
        }
    }
}

