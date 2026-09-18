package com.aiclassroom.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class RubricItem {
    private String id;
    private String criteria;
    private Double weightPct;
    private Double maxScore;
    private String description;

    public RubricItem() {
    }

    public RubricItem(String id, String criteria, Double weightPct, Double maxScore, String description) {
        this.id = id;
        this.criteria = criteria;
        this.weightPct = weightPct;
        this.maxScore = maxScore;
        this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCriteria() { return criteria; }
    public void setCriteria(String criteria) { this.criteria = criteria; }

    public Double getWeightPct() { return weightPct; }
    public void setWeightPct(Double weightPct) { this.weightPct = weightPct; }

    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static RubricItemBuilder builder() { return new RubricItemBuilder(); }

    public static class RubricItemBuilder {
        private String id;
        private String criteria;
        private Double weightPct;
        private Double maxScore;
        private String description;

        public RubricItemBuilder id(String id) { this.id = id; return this; }
        public RubricItemBuilder criteria(String criteria) { this.criteria = criteria; return this; }
        public RubricItemBuilder weightPct(Double weightPct) { this.weightPct = weightPct; return this; }
        public RubricItemBuilder maxScore(Double maxScore) { this.maxScore = maxScore; return this; }
        public RubricItemBuilder description(String description) { this.description = description; return this; }

        public RubricItem build() {
            return new RubricItem(id, criteria, weightPct, maxScore, description);
        }
    }
}
