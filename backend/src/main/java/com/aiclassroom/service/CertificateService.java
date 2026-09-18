package com.aiclassroom.service;

import com.aiclassroom.model.Certificate;
import com.aiclassroom.repository.CertificateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CertificateService {
    private final CertificateRepository certificateRepository;

    public CertificateService(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
    }

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public List<Certificate> getCertificatesByStudent(String studentId) {
        return certificateRepository.findByStudentId(studentId);
    }

    public Certificate addCertificate(Certificate certificate) {
        if (certificate.getId() == null || certificate.getId().isEmpty()) {
            certificate.setId("cert-" + System.currentTimeMillis());
        }
        if (certificate.getVerified() == null) {
            certificate.setVerified(true);
        }
        return certificateRepository.save(certificate);
    }
}
