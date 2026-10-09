package com.aiclassroom.model;

import jakarta.persistence.*;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    private String id;
    private String assignmentId;
    private String studentId;
    private String studentName;
    private String submittedAt;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String fileName;

    @Column(columnDefinition = "TEXT")
    private String fileUrl;

    private String fileType;

    private Double similarityPercentage;
    private String plagiarismStatus; // ACCEPTED, FLAGGED_PLAGIARISM
    private Boolean aiEvaluated;
    private Double aiSuggestedGrade;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "submission_rubric_scores", joinColumns = @JoinColumn(name = "submission_id"))
    @MapKeyColumn(name = "rubric_id")
    @Column(name = "score")
    private Map<String, Double> aiRubricBreakdown = new HashMap<>();

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    private String status; // PENDING_REVIEW, FINALIZED, REJECTED_PLAGIARISM
    private Double teacherFinalGrade;

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;

    private Boolean isBelowThreshold;

    public Submission() {
    }

    public Submission(String id, String assignmentId, String studentId, String studentName, String submittedAt, String content, String fileName, String fileUrl, String fileType, Double similarityPercentage, String plagiarismStatus, Boolean aiEvaluated, Double aiSuggestedGrade, Map<String, Double> aiRubricBreakdown, String aiFeedback, String status, Double teacherFinalGrade, String teacherFeedback, Boolean isBelowThreshold) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.submittedAt = submittedAt;
        this.content = content;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.similarityPercentage = similarityPercentage;
        this.plagiarismStatus = plagiarismStatus;
        this.aiEvaluated = aiEvaluated;
        this.aiSuggestedGrade = aiSuggestedGrade;
        this.aiRubricBreakdown = aiRubricBreakdown != null ? aiRubricBreakdown : new HashMap<>();
        this.aiFeedback = aiFeedback;
        this.status = status;
        this.teacherFinalGrade = teacherFinalGrade;
        this.teacherFeedback = teacherFeedback;
        this.isBelowThreshold = isBelowThreshold;
    }

    @PrePersist
    @PreUpdate
    private void sanitizeDataForPostgreSql() {
        this.content = cleanNullBytes(this.content);
        this.fileName = cleanNullBytes(this.fileName);
        this.fileUrl = cleanNullBytes(this.fileUrl);
        this.fileType = cleanNullBytes(this.fileType);
        this.studentName = cleanNullBytes(this.studentName);
        this.aiFeedback = cleanNullBytes(this.aiFeedback);
        this.teacherFeedback = cleanNullBytes(this.teacherFeedback);
    }

    private String cleanNullBytes(String val) {
        if (val == null) return null;
        return val.replace("\u0000", "").replace("\0", "");
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Double getSimilarityPercentage() { return similarityPercentage; }
    public void setSimilarityPercentage(Double similarityPercentage) { this.similarityPercentage = similarityPercentage; }

    public String getPlagiarismStatus() { return plagiarismStatus; }
    public void setPlagiarismStatus(String plagiarismStatus) { this.plagiarismStatus = plagiarismStatus; }

    public Boolean getAiEvaluated() { return aiEvaluated; }
    public void setAiEvaluated(Boolean aiEvaluated) { this.aiEvaluated = aiEvaluated; }

    public Double getAiSuggestedGrade() { return aiSuggestedGrade; }
    public void setAiSuggestedGrade(Double aiSuggestedGrade) { this.aiSuggestedGrade = aiSuggestedGrade; }

    public Map<String, Double> getAiRubricBreakdown() { return aiRubricBreakdown; }
    public void setAiRubricBreakdown(Map<String, Double> aiRubricBreakdown) { this.aiRubricBreakdown = aiRubricBreakdown; }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTeacherFinalGrade() { return teacherFinalGrade; }
    public void setTeacherFinalGrade(Double teacherFinalGrade) { this.teacherFinalGrade = teacherFinalGrade; }

    public String getTeacherFeedback() { return teacherFeedback; }
    public void setTeacherFeedback(String teacherFeedback) { this.teacherFeedback = teacherFeedback; }

    public Boolean getIsBelowThreshold() { return isBelowThreshold; }
    public void setIsBelowThreshold(Boolean isBelowThreshold) { this.isBelowThreshold = isBelowThreshold; }

    public static SubmissionBuilder builder() { return new SubmissionBuilder(); }

    public static class SubmissionBuilder {
        private String id;
        private String assignmentId;
        private String studentId;
        private String studentName;
        private String submittedAt;
        private String content;
        private String fileName;
        private String fileUrl;
        private String fileType;
        private Double similarityPercentage;
        private String plagiarismStatus;
        private Boolean aiEvaluated;
        private Double aiSuggestedGrade;
        private Map<String, Double> aiRubricBreakdown = new HashMap<>();
        private String aiFeedback;
        private String status;
        private Double teacherFinalGrade;
        private String teacherFeedback;
        private Boolean isBelowThreshold;

        public SubmissionBuilder id(String id) { this.id = id; return this; }
        public SubmissionBuilder assignmentId(String assignmentId) { this.assignmentId = assignmentId; return this; }
        public SubmissionBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public SubmissionBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public SubmissionBuilder submittedAt(String submittedAt) { this.submittedAt = submittedAt; return this; }
        public SubmissionBuilder content(String content) { this.content = content; return this; }
        public SubmissionBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public SubmissionBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public SubmissionBuilder fileType(String fileType) { this.fileType = fileType; return this; }
        public SubmissionBuilder similarityPercentage(Double similarityPercentage) { this.similarityPercentage = similarityPercentage; return this; }
        public SubmissionBuilder plagiarismStatus(String plagiarismStatus) { this.plagiarismStatus = plagiarismStatus; return this; }
        public SubmissionBuilder aiEvaluated(Boolean aiEvaluated) { this.aiEvaluated = aiEvaluated; return this; }
        public SubmissionBuilder aiSuggestedGrade(Double aiSuggestedGrade) { this.aiSuggestedGrade = aiSuggestedGrade; return this; }
        public SubmissionBuilder aiRubricBreakdown(Map<String, Double> aiRubricBreakdown) { this.aiRubricBreakdown = aiRubricBreakdown; return this; }
        public SubmissionBuilder aiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; return this; }
        public SubmissionBuilder status(String status) { this.status = status; return this; }
        public SubmissionBuilder teacherFinalGrade(Double teacherFinalGrade) { this.teacherFinalGrade = teacherFinalGrade; return this; }
        public SubmissionBuilder teacherFeedback(String teacherFeedback) { this.teacherFeedback = teacherFeedback; return this; }
        public SubmissionBuilder isBelowThreshold(Boolean isBelowThreshold) { this.isBelowThreshold = isBelowThreshold; return this; }

        public Submission build() {
            return new Submission(id, assignmentId, studentId, studentName, submittedAt, content, fileName, fileUrl, fileType, similarityPercentage, plagiarismStatus, aiEvaluated, aiSuggestedGrade, aiRubricBreakdown, aiFeedback, status, teacherFinalGrade, teacherFeedback, isBelowThreshold);
        }
    }
}
