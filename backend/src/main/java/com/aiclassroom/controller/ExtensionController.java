package com.aiclassroom.controller;

import com.aiclassroom.model.Extension;
import com.aiclassroom.service.ExtensionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/extensions")
public class ExtensionController {
    private final ExtensionService extensionService;

    public ExtensionController(ExtensionService extensionService) {
        this.extensionService = extensionService;
    }

    @GetMapping
    public ResponseEntity<List<Extension>> getAllExtensions(@RequestParam(required = false) String assignmentId) {
        if (assignmentId != null && !assignmentId.isEmpty()) {
            return ResponseEntity.ok(extensionService.getExtensionsByAssignment(assignmentId));
        }
        return ResponseEntity.ok(extensionService.getAllExtensions());
    }

    @PostMapping
    public ResponseEntity<Extension> grantExtension(@RequestBody Extension extension) {
        return ResponseEntity.ok(extensionService.grantExtension(extension));
    }
}
