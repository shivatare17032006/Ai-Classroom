package com.aiclassroom.controller;

import com.aiclassroom.dto.ApiResponse;
import com.aiclassroom.dto.JoinClassroomRequest;
import com.aiclassroom.model.Classroom;
import com.aiclassroom.model.User;
import com.aiclassroom.service.ClassroomService;
import com.aiclassroom.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {
    private final ClassroomService classroomService;
    private final UserService userService;

    public ClassroomController(ClassroomService classroomService, UserService userService) {
        this.classroomService = classroomService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Classroom>> getAllClassrooms() {
        return ResponseEntity.ok(classroomService.getAllClassrooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classroom> getClassroomById(@PathVariable String id) {
        return classroomService.getClassroomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Classroom> createClassroom(
            @RequestBody Classroom classroom, 
            @RequestParam(required = false) String teacherId) {
        
        String effectiveTeacherId = teacherId;
        if (effectiveTeacherId == null || effectiveTeacherId.isEmpty()) {
            effectiveTeacherId = classroom.getTeacherId();
        }

        User teacher = effectiveTeacherId != null ? userService.getUserById(effectiveTeacherId).orElse(null) : null;
        return ResponseEntity.ok(classroomService.createClassroom(classroom, teacher));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<Classroom>> joinClassroom(@RequestBody JoinClassroomRequest req) {
        ApiResponse<Classroom> response = classroomService.joinClassroomByCode(req.getCode(), req.getStudentId());
        return ResponseEntity.ok(response);
    }
}
