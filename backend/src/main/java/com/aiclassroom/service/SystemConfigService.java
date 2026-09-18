package com.aiclassroom.service;

import com.aiclassroom.model.SystemConfig;
import com.aiclassroom.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemConfigService {
    private final SystemConfigRepository configRepository;

    public SystemConfigService(SystemConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    public SystemConfig getConfig() {
        List<SystemConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) {
            SystemConfig defaultConfig = SystemConfig.builder()
                    .id("config-1")
                    .globalDefaultSimilarityThreshold(15.0)
                    .autoEmailParents(true)
                    .aiModelProvider("Gemini 3.5 Pro (Spring Boot)")
                    .systemVersion("v1.4.0-PROD")
                    .build();
            return configRepository.save(defaultConfig);
        }
        return configs.get(0);
    }

    public SystemConfig updateConfig(SystemConfig newConfig) {
        newConfig.setId("config-1");
        return configRepository.save(newConfig);
    }
}
