package com.aiclassroom.controller;

import com.aiclassroom.dto.ReviewGradeRequest;
import com.aiclassroom.dto.SubmissionRequest;
import com.aiclassroom.model.Submission;
import com.aiclassroom.service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
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
}
