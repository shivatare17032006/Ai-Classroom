package com.aiclassroom.service;

import com.aiclassroom.dto.ReviewGradeRequest;
import com.aiclassroom.dto.SubmissionRequest;
import com.aiclassroom.model.*;
import com.aiclassroom.repository.AssignmentRepository;
import com.aiclassroom.repository.SubmissionRepository;
import com.aiclassroom.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final GeminiService geminiService;
    private final PlagiarismService plagiarismService;

    public SubmissionService(SubmissionRepository submissionRepository, AssignmentRepository assignmentRepository, UserRepository userRepository, NotificationService notificationService, GeminiService geminiService, PlagiarismService plagiarismService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.geminiService = geminiService;
        this.plagiarismService = plagiarismService;
    }

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public List<Submission> getSubmissionsByAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<Submission> getSubmissionsByStudent(String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public Optional<Submission> getSubmissionById(String id) {
        return submissionRepository.findById(id);
    }

    public Submission submitAssignment(SubmissionRequest req) {
        Optional<Assignment> assignmentOpt = assignmentRepository.findById(req.getAssignmentId());
        Assignment assignment = assignmentOpt.orElse(null);

        double similarityThreshold = assignment != null && assignment.getSimilarityThreshold() != null 
                ? assignment.getSimilarityThreshold() : 15.0;

        String submissionId = "sub-" + System.currentTimeMillis();
        String nowStr = LocalDateTime.now().toString();

        // Perform multi-algorithm Plagiarism Analysis
        List<Submission> existingSubmissions = submissionRepository.findByAssignmentId(req.getAssignmentId());
        PlagiarismService.PlagiarismReport plagReport = plagiarismService.analyzePlagiarism(
                submissionId,
                req.getStudentId(),
                req.getContent(),
                existingSubmissions,
                similarityThreshold
        );

        double similarityScore = plagReport.getSimilarityPercentage();
        boolean isPlagiarized = "FLAGGED_PLAGIARISM".equals(plagReport.getStatus());

        Submission submission = Submission.builder()
                .id(submissionId)
                .assignmentId(req.getAssignmentId())
                .studentId(req.getStudentId())
                .studentName(req.getStudentName())
                .submittedAt(nowStr)
                .content(req.getContent())
                .fileName(req.getFileName())
                .similarityPercentage(similarityScore)
                .plagiarismStatus(isPlagiarized ? "FLAGGED_PLAGIARISM" : "ACCEPTED")
                .aiEvaluated(!isPlagiarized)
                .status(isPlagiarized ? "REJECTED_PLAGIARISM" : "PENDING_REVIEW")
                .teacherFinalGrade(isPlagiarized ? 0.0 : null)
                .isBelowThreshold(isPlagiarized)
                .build();

        if (!isPlagiarized && assignment != null) {
            double totalMarks = assignment.getMaximumMarks() != null ? assignment.getMaximumMarks() : 10.0;
            double aiPercentage = 0.75 + (Math.random() * 0.2); // 75% - 95%
            double aiScore = Math.round(totalMarks * aiPercentage * 10.0) / 10.0;

            Map<String, Double> aiRubricBreakdown = new HashMap<>();
            StringBuilder rubricSummary = new StringBuilder();
            if (assignment.getRubric() != null) {
                for (RubricItem item : assignment.getRubric()) {
                    double maxScore = item.getMaxScore() != null ? item.getMaxScore() : 2.0;
                    double itemScore = Math.round(maxScore * aiPercentage * 10.0) / 10.0;
                    aiRubricBreakdown.put(item.getId(), itemScore);
                    rubricSummary.append(item.getCriteria()).append(" (Max ").append(maxScore).append("); ");
                }
            }

            // Call Gemini 1.5 Pro REST API
            String geminiFeedback = geminiService.evaluateSubmissionWithGemini(
                req.getContent(),
                assignment.getTitle() + ": " + assignment.getDescription(),
                rubricSummary.toString()
            );

            submission.setAiSuggestedGrade(aiScore);
            submission.setAiRubricBreakdown(aiRubricBreakdown);
            submission.setAiFeedback(geminiFeedback);
        } else if (isPlagiarized) {
            submission.setAiFeedback("Submission rejected prior to AI grading. Similarity " + similarityScore + "% exceeds allowed threshold (" + similarityThreshold + "%).");

            // Dispatch notification to teacher
            notificationService.sendNotification(Notification.builder()
                    .recipientEmail("sarah.jenkins@university.edu")
                    .recipientRole("TEACHER")
                    .studentId(req.getStudentId())
                    .studentName(req.getStudentName())
                    .type("PLAGIARISM_ALERT")
                    .title("Academic Integrity Alert: Similarity Threshold Exceeded")
                    .message("Student " + req.getStudentName() + " submitted work with " + similarityScore + "% similarity (Allowed threshold: " + similarityThreshold + "%). Submission automatically flagged.")
                    .build());
        }

        return submissionRepository.save(submission);
    }

    public Optional<Submission> reviewAiGrade(String submissionId, ReviewGradeRequest reviewReq) {
        Optional<Submission> subOpt = submissionRepository.findById(submissionId);
        if (subOpt.isEmpty()) return Optional.empty();

        Submission sub = subOpt.get();
        Optional<Assignment> assignmentOpt = assignmentRepository.findById(sub.getAssignmentId());
        Assignment assignment = assignmentOpt.orElse(null);

        double minThreshold = assignment != null && assignment.getMinimumThreshold() != null 
                ? assignment.getMinimumThreshold() : 5.0;
        double maxMarks = assignment != null && assignment.getMaximumMarks() != null 
                ? assignment.getMaximumMarks() : 10.0;
        String assignmentTitle = assignment != null ? assignment.getTitle() : "Assignment";

        double finalScore = reviewReq.getFinalScore() != null ? reviewReq.getFinalScore() : 0.0;
        boolean isBelow = finalScore < minThreshold;

        sub.setTeacherFinalGrade(finalScore);
        sub.setTeacherFeedback(reviewReq.getTeacherComments());
        sub.setStatus("FINALIZED");
        sub.setIsBelowThreshold(isBelow);

        Submission updated = submissionRepository.save(sub);

        // Auto-dispatch notifications if score falls below minimum threshold
        if (isBelow) {
            Optional<User> studentOpt = userRepository.findById(sub.getStudentId());
            User student = studentOpt.orElse(null);

            String alertMsg = "Alert: " + sub.getStudentName() + " scored " + finalScore + "/" + maxMarks + " in \"" + assignmentTitle + "\", which is below the minimum passing threshold (" + minThreshold + "/" + maxMarks + ").";

            // 1. Student Notification
            notificationService.sendNotification(Notification.builder()
                    .recipientEmail(student != null ? student.getEmail() : "student@university.edu")
                    .recipientRole("STUDENT")
                    .studentId(sub.getStudentId())
                    .studentName(sub.getStudentName())
                    .type("LOW_SCORE_FLAG")
                    .title("Academic Threshold Alert")
                    .message(alertMsg)
                    .build());

            // 2. Parent Notification
            if (student != null && student.getParentEmail() != null && !student.getParentEmail().isEmpty()) {
                notificationService.sendNotification(Notification.builder()
                        .recipientEmail(student.getParentEmail())
                        .recipientRole("PARENT")
                        .studentId(sub.getStudentId())
                        .studentName(sub.getStudentName())
                        .type("LOW_SCORE_FLAG")
                        .title("Parent Notification: Academic Alert")
                        .message(alertMsg)
                        .build());
            }

            // 3. Teacher Notification
            notificationService.sendNotification(Notification.builder()
                    .recipientEmail("sarah.jenkins@university.edu")
                    .recipientRole("TEACHER")
                    .studentId(sub.getStudentId())
                    .studentName(sub.getStudentName())
                    .type("LOW_SCORE_FLAG")
                    .title("Student Flagged Below Threshold")
                    .message(alertMsg)
                    .build());
        }

        return Optional.of(updated);
    }
}
