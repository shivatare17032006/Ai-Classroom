package com.aiclassroom.repository;

import com.aiclassroom.model.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, String> {
    Optional<Classroom> findByCodeIgnoreCase(String code);
    List<Classroom> findByTeacherId(String teacherId);
}
