package com.aiclassroom.controller;

import com.aiclassroom.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/assignment")
    public ResponseEntity<?> sendAssignmentEmail(@RequestBody Map<String, Object> payload) {
        String studentEmail = (String) payload.get("studentEmail");
        String classroomName = (String) payload.get("classroomName");
        String classroomCode = (String) payload.get("classroomCode");
        String assignmentTitle = (String) payload.get("assignmentTitle");
        String dueDate = (String) payload.get("dueDate");
        Double maxMarks = payload.get("maxMarks") != null ? Double.parseDouble(payload.get("maxMarks").toString()) : 10.0;

        emailService.sendNewAssignmentNotification(studentEmail, classroomName, classroomCode, assignmentTitle, dueDate, maxMarks);
        return ResponseEntity.ok(Map.of("success", true, "message", "Assignment notification email dispatched to " + studentEmail));
    }

    @PostMapping("/announcement")
    public ResponseEntity<?> sendAnnouncementEmail(@RequestBody Map<String, Object> payload) {
        String studentEmail = (String) payload.get("studentEmail");
        String classroomName = (String) payload.get("classroomName");
        String classroomCode = (String) payload.get("classroomCode");
        String teacherName = (String) payload.get("teacherName");
        String title = (String) payload.get("title");
        String content = (String) payload.get("content");

        emailService.sendAnnouncementNotification(studentEmail, classroomName, classroomCode, teacherName, title, content);
        return ResponseEntity.ok(Map.of("success", true, "message", "Announcement email dispatched to " + studentEmail));
    }

    @PostMapping("/due-today")
    public ResponseEntity<?> sendDueTodayEmail(@RequestBody Map<String, Object> payload) {
        String studentEmail = (String) payload.get("studentEmail");
        String classroomName = (String) payload.get("classroomName");
        String assignmentTitle = (String) payload.get("assignmentTitle");
        String dueDate = (String) payload.get("dueDate");

        emailService.sendDueTodayReminder(studentEmail, classroomName, assignmentTitle, dueDate);
        return ResponseEntity.ok(Map.of("success", true, "message", "Due today reminder email dispatched to " + studentEmail));
    }

    @PostMapping("/parent-alert")
    public ResponseEntity<?> sendParentAlertEmail(@RequestBody Map<String, Object> payload) {
        String parentEmail = (String) payload.get("parentEmail");
        String studentName = (String) payload.get("studentName");
        String classroomName = (String) payload.get("classroomName");
        String assignmentTitle = (String) payload.get("assignmentTitle");
        Double scoreReceived = payload.get("scoreReceived") != null ? Double.parseDouble(payload.get("scoreReceived").toString()) : 0.0;
        Double maxMarks = payload.get("maxMarks") != null ? Double.parseDouble(payload.get("maxMarks").toString()) : 10.0;
        Double minThreshold = payload.get("minThreshold") != null ? Double.parseDouble(payload.get("minThreshold").toString()) : 5.0;
        String teacherFeedback = (String) payload.get("teacherFeedback");

        emailService.sendParentAcademicAlert(parentEmail, studentName, classroomName, assignmentTitle, scoreReceived, maxMarks, minThreshold, teacherFeedback);
        return ResponseEntity.ok(Map.of("success", true, "message", "Parent academic alert email dispatched to " + parentEmail));
    }

    @PostMapping("/teacher-invoice")
    public ResponseEntity<?> sendTeacherInvoiceEmail(@RequestBody Map<String, Object> payload) {
        String teacherEmail = (String) payload.get("teacherEmail");
        String teacherName = (String) payload.get("teacherName");
        String planTitle = (String) payload.get("planTitle");
        Double amountInr = payload.get("amountInr") != null ? Double.parseDouble(payload.get("amountInr").toString()) : 499.0;
        String invoiceNo = (String) payload.get("invoiceNo");
        String transactionId = (String) payload.get("transactionId");

        emailService.sendTeacherLicenseInvoice(teacherEmail, teacherName, planTitle, amountInr, invoiceNo, transactionId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Teacher invoice email dispatched to " + teacherEmail));
    }

    @PostMapping("/institution-approval")
    public ResponseEntity<?> sendInstitutionApprovalEmail(@RequestBody Map<String, Object> payload) {
        String contactEmail = (String) payload.get("contactEmail");
        String contactName = (String) payload.get("contactName");
        String institutionName = (String) payload.get("institutionName");
        String domainExtension = (String) payload.get("domainExtension");

        emailService.sendInstitutionalApprovalNotification(contactEmail, contactName, institutionName, domainExtension);
        return ResponseEntity.ok(Map.of("success", true, "message", "Institutional approval email dispatched to " + contactEmail));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendForgotPasswordEmail(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String otpCode = (String) payload.get("otpCode");

        emailService.sendPasswordResetOtp(email, name, otpCode);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset OTP dispatched to " + email));
    }
}
