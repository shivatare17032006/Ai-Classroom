package com.aiclassroom.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments")
public class Assignment {
    @Id
    private String id;
    private String classroomId;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String requiredTopic;
    private Boolean strictTopicCheck; // If true, topic/tech mismatch yields 0 marks

    private Boolean allowLateSubmissions; // Enable/Disable late submissions after deadline
    private Double latePenaltyPercentage; // Penalty % subtracted for late submissions (e.g. 10.0)

    private Double maximumMarks;
    private Double minimumThreshold;
    private Double similarityThreshold;
    private String dueDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "assignment_rubrics", joinColumns = @JoinColumn(name = "assignment_id"))
    private List<RubricItem> rubric = new ArrayList<>();

    public Assignment() {
    }

    public Assignment(String id, String classroomId, String title, String description, String requiredTopic, Boolean strictTopicCheck, Boolean allowLateSubmissions, Double latePenaltyPercentage, Double maximumMarks, Double minimumThreshold, Double similarityThreshold, String dueDate, List<RubricItem> rubric) {
        this.id = id;
        this.classroomId = classroomId;
        this.title = title;
        this.description = description;
        this.requiredTopic = requiredTopic;
        this.strictTopicCheck = strictTopicCheck != null ? strictTopicCheck : true;
        this.allowLateSubmissions = allowLateSubmissions != null ? allowLateSubmissions : true;
        this.latePenaltyPercentage = latePenaltyPercentage != null ? latePenaltyPercentage : 10.0;
        this.maximumMarks = maximumMarks;
        this.minimumThreshold = minimumThreshold;
        this.similarityThreshold = similarityThreshold;
        this.dueDate = dueDate;
        this.rubric = rubric != null ? rubric : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClassroomId() { return classroomId; }
    public void setClassroomId(String classroomId) { this.classroomId = classroomId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequiredTopic() { return requiredTopic; }
    public void setRequiredTopic(String requiredTopic) { this.requiredTopic = requiredTopic; }

    public Boolean getStrictTopicCheck() { return strictTopicCheck; }
    public void setStrictTopicCheck(Boolean strictTopicCheck) { this.strictTopicCheck = strictTopicCheck; }

    public Boolean getAllowLateSubmissions() { return allowLateSubmissions; }
    public void setAllowLateSubmissions(Boolean allowLateSubmissions) { this.allowLateSubmissions = allowLateSubmissions; }

    public Double getLatePenaltyPercentage() { return latePenaltyPercentage; }
    public void setLatePenaltyPercentage(Double latePenaltyPercentage) { this.latePenaltyPercentage = latePenaltyPercentage; }

    public Double getMaximumMarks() { return maximumMarks; }
    public void setMaximumMarks(Double maximumMarks) { this.maximumMarks = maximumMarks; }

    public Double getMinimumThreshold() { return minimumThreshold; }
    public void setMinimumThreshold(Double minimumThreshold) { this.minimumThreshold = minimumThreshold; }

    public Double getSimilarityThreshold() { return similarityThreshold; }
    public void setSimilarityThreshold(Double similarityThreshold) { this.similarityThreshold = similarityThreshold; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public List<RubricItem> getRubric() { return rubric; }
    public void setRubric(List<RubricItem> rubric) { this.rubric = rubric; }

    public static AssignmentBuilder builder() { return new AssignmentBuilder(); }

    public static class AssignmentBuilder {
        private String id;
        private String classroomId;
        private String title;
        private String description;
        private String requiredTopic;
        private Boolean strictTopicCheck = true;
        private Boolean allowLateSubmissions = true;
        private Double latePenaltyPercentage = 10.0;
        private Double maximumMarks;
        private Double minimumThreshold;
        private Double similarityThreshold;
        private String dueDate;
        private List<RubricItem> rubric = new ArrayList<>();

        public AssignmentBuilder id(String id) { this.id = id; return this; }
        public AssignmentBuilder classroomId(String classroomId) { this.classroomId = classroomId; return this; }
        public AssignmentBuilder title(String title) { this.title = title; return this; }
        public AssignmentBuilder description(String description) { this.description = description; return this; }
        public AssignmentBuilder requiredTopic(String requiredTopic) { this.requiredTopic = requiredTopic; return this; }
        public AssignmentBuilder strictTopicCheck(Boolean strictTopicCheck) { this.strictTopicCheck = strictTopicCheck; return this; }
        public AssignmentBuilder allowLateSubmissions(Boolean allowLateSubmissions) { this.allowLateSubmissions = allowLateSubmissions; return this; }
        public AssignmentBuilder latePenaltyPercentage(Double latePenaltyPercentage) { this.latePenaltyPercentage = latePenaltyPercentage; return this; }
        public AssignmentBuilder maximumMarks(Double maximumMarks) { this.maximumMarks = maximumMarks; return this; }
        public AssignmentBuilder minimumThreshold(Double minimumThreshold) { this.minimumThreshold = minimumThreshold; return this; }
        public AssignmentBuilder similarityThreshold(Double similarityThreshold) { this.similarityThreshold = similarityThreshold; return this; }
        public AssignmentBuilder dueDate(String dueDate) { this.dueDate = dueDate; return this; }
        public AssignmentBuilder rubric(List<RubricItem> rubric) { this.rubric = rubric; return this; }

        public Assignment build() {
            return new Assignment(id, classroomId, title, description, requiredTopic, strictTopicCheck, allowLateSubmissions, latePenaltyPercentage, maximumMarks, minimumThreshold, similarityThreshold, dueDate, rubric);
        }
    }
}
