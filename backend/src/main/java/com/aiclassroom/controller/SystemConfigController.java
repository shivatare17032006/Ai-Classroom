package com.aiclassroom.controller;

import com.aiclassroom.model.SystemConfig;
import com.aiclassroom.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class SystemConfigController {
    private final SystemConfigService configService;

    public SystemConfigController(SystemConfigService configService) {
        this.configService = configService;
    }

    @GetMapping
    public ResponseEntity<SystemConfig> getConfig() {
        return ResponseEntity.ok(configService.getConfig());
    }

    @PutMapping
    public ResponseEntity<SystemConfig> updateConfig(@RequestBody SystemConfig config) {
        return ResponseEntity.ok(configService.updateConfig(config));
    }
}
