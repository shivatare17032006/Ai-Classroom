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

        // 1. Lock check: Prevent resubmission if student's previous submission is already finalized
        List<Submission> existingSubmissions = submissionRepository.findByAssignmentId(req.getAssignmentId());
        for (Submission existing : existingSubmissions) {
            if (existing.getStudentId().equals(req.getStudentId()) && "FINALIZED".equals(existing.getStatus())) {
                throw new IllegalStateException("Submission Locked: You have already submitted this assignment and your grade has been finalized by the instructor.");
            }
        }

        // 2. Deadline & Late submission check
        boolean isLate = false;
        double penaltyPct = 0.0;
        if (assignment != null && assignment.getDueDate() != null && !assignment.getDueDate().isEmpty()) {
            try {
                LocalDateTime due = LocalDateTime.parse(assignment.getDueDate());
                if (LocalDateTime.now().isAfter(due)) {
                    isLate = true;
                    Boolean allowLate = assignment.getAllowLateSubmissions() != null ? assignment.getAllowLateSubmissions() : true;
                    if (!allowLate) {
                        throw new IllegalStateException("Deadline Passed: Submissions for this assignment are closed. Late submissions are not accepted.");
                    }
                    penaltyPct = assignment.getLatePenaltyPercentage() != null ? assignment.getLatePenaltyPercentage() : 10.0;
                }
            } catch (Exception e) {
                if (e instanceof IllegalStateException) throw (IllegalStateException) e;
            }
        }

        double similarityThreshold = assignment != null && assignment.getSimilarityThreshold() != null 
                ? assignment.getSimilarityThreshold() : 15.0;

        String submissionId = "sub-" + System.currentTimeMillis();
        String nowStr = LocalDateTime.now().toString();

        // Perform multi-algorithm Plagiarism Analysis
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
                .fileUrl(req.getFileUrl())
                .fileType(req.getFileType())
                .similarityPercentage(similarityScore)
                .plagiarismStatus(isPlagiarized ? "FLAGGED_PLAGIARISM" : "ACCEPTED")
                .aiEvaluated(!isPlagiarized)
                .status(isPlagiarized ? "REJECTED_PLAGIARISM" : "PENDING_REVIEW")
                .teacherFinalGrade(isPlagiarized ? 0.0 : null)
                .isBelowThreshold(isPlagiarized)
                .build();

        if (!isPlagiarized && assignment != null) {
            double totalMarks = assignment.getMaximumMarks() != null ? assignment.getMaximumMarks() : 10.0;
            StringBuilder rubricSummary = new StringBuilder();
            if (assignment.getRubric() != null) {
                for (RubricItem item : assignment.getRubric()) {
                    double maxScore = item.getMaxScore() != null ? item.getMaxScore() : 2.0;
                    rubricSummary.append(item.getCriteria()).append(" (Max ").append(maxScore).append("); ");
                }
            }

            String assignmentBrief = assignment.getTitle() + ": " + assignment.getDescription() +
                (assignment.getRequiredTopic() != null ? " [Required Subject/Topic: " + assignment.getRequiredTopic() + "]" : "");

            // Call Gemini 1.5 Pro REST API / Semantic Evaluator
            String geminiFeedback = geminiService.evaluateSubmissionWithGemini(
                req.getContent(),
                assignmentBrief,
                rubricSummary.toString()
            );

            // Parse score ratio (0.0 to 1.0) from Gemini evaluation result
            double scoreRatio = GeminiService.parseScoreRatio(geminiFeedback);
            double rawScore = Math.round(totalMarks * scoreRatio * 10.0) / 10.0;
            double aiScore = rawScore;

            // Apply Late Submission Penalty if submitted after deadline
            if (isLate && penaltyPct > 0.0) {
                double penaltyDeduction = Math.round(totalMarks * (penaltyPct / 100.0) * 10.0) / 10.0;
                aiScore = Math.max(0.0, Math.round((rawScore - penaltyDeduction) * 10.0) / 10.0);
                geminiFeedback = geminiFeedback + String.format("\n[LATE SUBMISSION PENALTY APPLIED: -%.1f%% (-%.1f marks) deducted for submitting after deadline.]", penaltyPct, penaltyDeduction);
            }

            Map<String, Double> aiRubricBreakdown = new HashMap<>();
            if (assignment.getRubric() != null) {
                for (RubricItem item : assignment.getRubric()) {
                    double maxScore = item.getMaxScore() != null ? item.getMaxScore() : 2.0;
                    double itemScore = Math.round(maxScore * scoreRatio * 10.0) / 10.0;
                    aiRubricBreakdown.put(item.getId(), itemScore);
                }
            }

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
