package com.aiclassroom.service;

import com.aiclassroom.model.Assignment;
import com.aiclassroom.repository.AssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;

    public AssignmentService(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public List<Assignment> getAssignmentsByClassroom(String classroomId) {
        return assignmentRepository.findByClassroomId(classroomId);
    }

    public Optional<Assignment> getAssignmentById(String id) {
        return assignmentRepository.findById(id);
    }

    public Assignment createAssignment(Assignment assignment) {
        if (assignment.getId() == null || assignment.getId().isEmpty()) {
            assignment.setId("asg-" + System.currentTimeMillis());
        }
        return assignmentRepository.save(assignment);
    }
}
