package com.aiclassroom.dto;

public class ReviewGradeRequest {
    private Double finalScore;
    private String teacherComments;

    public ReviewGradeRequest() {
    }

    public ReviewGradeRequest(Double finalScore, String teacherComments) {
        this.finalScore = finalScore;
        this.teacherComments = teacherComments;
    }

    public Double getFinalScore() { return finalScore; }
    public void setFinalScore(Double finalScore) { this.finalScore = finalScore; }

    public String getTeacherComments() { return teacherComments; }
    public void setTeacherComments(String teacherComments) { this.teacherComments = teacherComments; }
}
