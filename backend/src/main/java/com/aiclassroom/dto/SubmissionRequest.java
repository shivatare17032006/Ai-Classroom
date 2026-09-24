package com.aiclassroom.dto;

public class SubmissionRequest {
    private String assignmentId;
    private String studentId;
    private String studentName;
    private String content;
    private String fileName;
    private String fileUrl;
    private String fileType;

    public SubmissionRequest() {
    }

    public SubmissionRequest(String assignmentId, String studentId, String studentName, String content, String fileName, String fileUrl, String fileType) {
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.content = content;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
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

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
}
