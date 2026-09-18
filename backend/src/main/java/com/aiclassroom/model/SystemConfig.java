package com.aiclassroom.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_config")
public class SystemConfig {
    @Id
    private String id;
    private Double globalDefaultSimilarityThreshold;
    private Boolean autoEmailParents;
    private String aiModelProvider;
    private String systemVersion;

    public SystemConfig() {
    }

    public SystemConfig(String id, Double globalDefaultSimilarityThreshold, Boolean autoEmailParents, String aiModelProvider, String systemVersion) {
        this.id = id;
        this.globalDefaultSimilarityThreshold = globalDefaultSimilarityThreshold;
        this.autoEmailParents = autoEmailParents;
        this.aiModelProvider = aiModelProvider;
        this.systemVersion = systemVersion;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Double getGlobalDefaultSimilarityThreshold() { return globalDefaultSimilarityThreshold; }
    public void setGlobalDefaultSimilarityThreshold(Double globalDefaultSimilarityThreshold) { this.globalDefaultSimilarityThreshold = globalDefaultSimilarityThreshold; }

    public Boolean getAutoEmailParents() { return autoEmailParents; }
    public void setAutoEmailParents(Boolean autoEmailParents) { this.autoEmailParents = autoEmailParents; }

    public String getAiModelProvider() { return aiModelProvider; }
    public void setAiModelProvider(String aiModelProvider) { this.aiModelProvider = aiModelProvider; }

    public String getSystemVersion() { return systemVersion; }
    public void setSystemVersion(String systemVersion) { this.systemVersion = systemVersion; }

    public static SystemConfigBuilder builder() { return new SystemConfigBuilder(); }

    public static class SystemConfigBuilder {
        private String id;
        private Double globalDefaultSimilarityThreshold;
        private Boolean autoEmailParents;
        private String aiModelProvider;
        private String systemVersion;

        public SystemConfigBuilder id(String id) { this.id = id; return this; }
        public SystemConfigBuilder globalDefaultSimilarityThreshold(Double globalDefaultSimilarityThreshold) { this.globalDefaultSimilarityThreshold = globalDefaultSimilarityThreshold; return this; }
        public SystemConfigBuilder autoEmailParents(Boolean autoEmailParents) { this.autoEmailParents = autoEmailParents; return this; }
        public SystemConfigBuilder aiModelProvider(String aiModelProvider) { this.aiModelProvider = aiModelProvider; return this; }
        public SystemConfigBuilder systemVersion(String systemVersion) { this.systemVersion = systemVersion; return this; }

        public SystemConfig build() {
            return new SystemConfig(id, globalDefaultSimilarityThreshold, autoEmailParents, aiModelProvider, systemVersion);
        }
    }
}
