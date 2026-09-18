package com.aiclassroom.controller;

import com.aiclassroom.model.Certificate;
import com.aiclassroom.service.CertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {
    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping
    public ResponseEntity<List<Certificate>> getCertificates(@RequestParam(required = false) String studentId) {
        if (studentId != null && !studentId.isEmpty()) {
            return ResponseEntity.ok(certificateService.getCertificatesByStudent(studentId));
        }
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @PostMapping
    public ResponseEntity<Certificate> addCertificate(@RequestBody Certificate certificate) {
        return ResponseEntity.ok(certificateService.addCertificate(certificate));
    }
}
