package com.aiclassroom.repository;

import com.aiclassroom.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByAssignmentId(String assignmentId);
    List<Submission> findByStudentId(String studentId);
}
