package com.aiclassroom.service;

import com.aiclassroom.dto.ApiResponse;
import com.aiclassroom.model.Classroom;
import com.aiclassroom.model.User;
import com.aiclassroom.repository.ClassroomRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClassroomService {
    private final ClassroomRepository classroomRepository;

    public ClassroomService(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }

    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    public Optional<Classroom> getClassroomById(String id) {
        return classroomRepository.findById(id);
    }

    public Classroom createClassroom(Classroom classroomData, User teacher) {
        String namePrefix = classroomData.getName() != null && classroomData.getName().length() >= 3 
                ? classroomData.getName().substring(0, 3).toUpperCase().replaceAll("[^A-Z]", "CS") 
                : "CS";
        String randomCode = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String classCode = namePrefix + "-" + randomCode;

        Classroom newClassroom = Classroom.builder()
                .id("cls-" + System.currentTimeMillis())
                .name(classroomData.getName())
                .code(classCode)
                .description(classroomData.getDescription() != null ? classroomData.getDescription() : "Google Classroom LMS Course")
                .section(classroomData.getSection() != null ? classroomData.getSection() : "Section A")
                .teacherId(teacher != null ? teacher.getId() : "usr-t1")
                .teacherName(teacher != null ? teacher.getName() : "Prof. Sarah Jenkins")
                .studentIds(new ArrayList<>())
                .build();

        return classroomRepository.save(newClassroom);
    }

    public ApiResponse<Classroom> joinClassroomByCode(String code, String studentId) {
        if (code == null || code.trim().isEmpty()) {
            return ApiResponse.error("Classroom code cannot be empty.");
        }

        String cleanCode = code.trim().toUpperCase();
        Optional<Classroom> optionalClassroom = classroomRepository.findByCodeIgnoreCase(cleanCode);

        if (optionalClassroom.isEmpty()) {
            return ApiResponse.error("Class code not found. Please verify the code with your teacher.");
        }

        Classroom classroom = optionalClassroom.get();
        if (classroom.getStudentIds() == null) {
            classroom.setStudentIds(new ArrayList<>());
        }

        if (classroom.getStudentIds().contains(studentId)) {
            return ApiResponse.success(classroom, "Already enrolled in this classroom.");
        }

        classroom.getStudentIds().add(studentId);
        Classroom updated = classroomRepository.save(classroom);
        return ApiResponse.success(updated, "Successfully joined classroom!");
    }
}
