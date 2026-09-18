package com.aiclassroom.repository;

import com.aiclassroom.model.Extension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtensionRepository extends JpaRepository<Extension, String> {
    List<Extension> findByAssignmentId(String assignmentId);
    List<Extension> findByStudentId(String studentId);
}
