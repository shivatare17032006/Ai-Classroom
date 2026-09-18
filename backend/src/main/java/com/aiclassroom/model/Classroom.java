package com.aiclassroom.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classrooms")
public class Classroom {
    @Id
    private String id;
    private String name;

    @Column(unique = true)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String section;
    private String teacherId;
    private String teacherName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "classroom_students", joinColumns = @JoinColumn(name = "classroom_id"))
    @Column(name = "student_id")
    private List<String> studentIds = new ArrayList<>();

    public Classroom() {
    }

    public Classroom(String id, String name, String code, String description, String section, String teacherId, String teacherName, List<String> studentIds) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.section = section;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.studentIds = studentIds != null ? studentIds : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public List<String> getStudentIds() { return studentIds; }
    public void setStudentIds(List<String> studentIds) { this.studentIds = studentIds; }

    public static ClassroomBuilder builder() { return new ClassroomBuilder(); }

    public static class ClassroomBuilder {
        private String id;
        private String name;
        private String code;
        private String description;
        private String section;
        private String teacherId;
        private String teacherName;
        private List<String> studentIds = new ArrayList<>();

        public ClassroomBuilder id(String id) { this.id = id; return this; }
        public ClassroomBuilder name(String name) { this.name = name; return this; }
        public ClassroomBuilder code(String code) { this.code = code; return this; }
        public ClassroomBuilder description(String description) { this.description = description; return this; }
        public ClassroomBuilder section(String section) { this.section = section; return this; }
        public ClassroomBuilder teacherId(String teacherId) { this.teacherId = teacherId; return this; }
        public ClassroomBuilder teacherName(String teacherName) { this.teacherName = teacherName; return this; }
        public ClassroomBuilder studentIds(List<String> studentIds) { this.studentIds = studentIds; return this; }

        public Classroom build() {
            return new Classroom(id, name, code, description, section, teacherId, teacherName, studentIds);
        }
    }
}
