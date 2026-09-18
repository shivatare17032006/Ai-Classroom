package com.aiclassroom.dto;

public class SubmissionRequest {
    private String assignmentId;
    private String studentId;
    private String studentName;
    private String content;
    private String fileName;

    public SubmissionRequest() {
    }

    public SubmissionRequest(String assignmentId, String studentId, String studentName, String content, String fileName) {
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.content = content;
        this.fileName = fileName;
    }

    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}
