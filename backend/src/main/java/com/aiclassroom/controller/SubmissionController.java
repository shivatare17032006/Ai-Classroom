package com.aiclassroom.controller;

import com.aiclassroom.dto.ReviewGradeRequest;
import com.aiclassroom.dto.SubmissionRequest;
import com.aiclassroom.model.Submission;
import com.aiclassroom.service.SpringAiGradingService;
import com.aiclassroom.service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;
    private final SpringAiGradingService springAiGradingService;

    public SubmissionController(SubmissionService submissionService, SpringAiGradingService springAiGradingService) {
        this.submissionService = submissionService;
        this.springAiGradingService = springAiGradingService;
    }

    @GetMapping
    public ResponseEntity<List<Submission>> getSubmissions(
            @RequestParam(required = false) String assignmentId,
            @RequestParam(required = false) String studentId) {
        if (assignmentId != null && !assignmentId.isEmpty()) {
            return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
        }
        if (studentId != null && !studentId.isEmpty()) {
            return ResponseEntity.ok(submissionService.getSubmissionsByStudent(studentId));
        }
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable String id) {
        return submissionService.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Submission> submitAssignment(@RequestBody SubmissionRequest req) {
        return ResponseEntity.ok(submissionService.submitAssignment(req));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Submission> reviewAiGrade(
            @PathVariable String id,
            @RequestBody ReviewGradeRequest reviewReq) {
        return submissionService.reviewAiGrade(id, reviewReq)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/evaluate-draft")
    public ResponseEntity<SpringAiGradingService.GradingEvaluationResult> evaluateDraftSubmission(@RequestBody Map<String, Object> payload) {
        String content = (String) payload.get("content");
        String title = (String) payload.getOrDefault("title", "Assignment Draft");
        String description = (String) payload.getOrDefault("description", "Draft evaluation request");
        String topic = (String) payload.getOrDefault("topic", "General");
        double maxMarks = payload.get("maxMarks") instanceof Number ? ((Number) payload.get("maxMarks")).doubleValue() : 10.0;
        
        @SuppressWarnings("unchecked")
        Map<String, String> rubricMap = payload.get("rubricMap") instanceof Map ? (Map<String, String>) payload.get("rubricMap") : null;

        SpringAiGradingService.GradingEvaluationResult result = springAiGradingService.gradeSubmission(
            content, title, description, topic, maxMarks, rubricMap
        );
        return ResponseEntity.ok(result);
    }
}
