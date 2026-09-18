package com.aiclassroom.repository;

import com.aiclassroom.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    List<Certificate> findByStudentId(String studentId);
}
