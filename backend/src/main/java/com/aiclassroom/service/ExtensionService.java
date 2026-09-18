package com.aiclassroom.service;

import com.aiclassroom.model.Extension;
import com.aiclassroom.repository.ExtensionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExtensionService {
    private final ExtensionRepository extensionRepository;

    public ExtensionService(ExtensionRepository extensionRepository) {
        this.extensionRepository = extensionRepository;
    }

    public List<Extension> getAllExtensions() {
        return extensionRepository.findAll();
    }

    public List<Extension> getExtensionsByAssignment(String assignmentId) {
        return extensionRepository.findByAssignmentId(assignmentId);
    }

    public Extension grantExtension(Extension extension) {
        if (extension.getId() == null || extension.getId().isEmpty()) {
            extension.setId("ext-" + System.currentTimeMillis());
        }
        extension.setStatus("APPROVED");
        extension.setApprovedAt(LocalDateTime.now().toString());
        return extensionRepository.save(extension);
    }
}
