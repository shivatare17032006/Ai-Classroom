package com.aiclassroom.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:aryanshivatare35@gmail.com}")
    private String fromEmail;

    /**
     * Core HTML Email Sender with SMTP & Fallback Console Logger
     */
    public boolean sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            log.warn("[EmailService] Recipient email is empty. Skipping dispatch.");
            return false;
        }

        log.info("================================================================================");
        log.info("[EMAIL DISPATCH] To: {} | Subject: {}", toEmail, subject);
        log.info("--------------------------------------------------------------------------------");
        log.info(htmlContent.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim());
        log.info("================================================================================");

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("[EmailService] SMTP Email successfully delivered to {}", toEmail);
                return true;
            } catch (Exception e) {
                log.error("[EmailService] SMTP delivery failed for {}: {}. Logged in system memory.", toEmail, e.getMessage());
            }
        }
        return true; // Returns true for dev/local simulation
    }

    /**
     * 1A. New Assignment Email Alert to Students
     */
    public void sendNewAssignmentNotification(String studentEmail, String classroomName, String classroomCode, String assignmentTitle, String dueDate, Double maxMarks) {
        String subject = String.format("[%s] 📝 New Assignment: %s", classroomCode != null ? classroomCode : classroomName, assignmentTitle);
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 15px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">AI-Enabled Classroom Portal</h2>
                    <p style="color: #e2e8f0; margin: 5px 0 0 0;">New Assignment Announcement</p>
                </div>
                <div style="padding: 20px; background-color: #1e293b; margin-top: 15px; border-radius: 8px; border: 1px solid #334155;">
                    <h3 style="color: #38bdf8; margin-top: 0;">Classroom: %s (%s)</h3>
                    <p><strong>Assignment Title:</strong> %s</p>
                    <p><strong>Maximum Marks:</strong> %.1f Marks</p>
                    <p><strong>Submission Due Date:</strong> <span style="color: #f59e0b; font-weight: bold;">%s</span></p>
                    <hr style="border-color: #334155;" />
                    <p style="color: #94a3b8; font-size: 0.9em;">Please log in to your Student Portal to review instructions and submit your work before the deadline.</p>
                </div>
            </div>
            """.formatted(classroomName, classroomCode, assignmentTitle, maxMarks != null ? maxMarks : 10.0, dueDate != null ? dueDate : "Today");

        sendHtmlEmail(studentEmail, subject, html);
    }

    /**
     * 1B. Stream Announcement Email to Students
     */
    public void sendAnnouncementNotification(String studentEmail, String classroomName, String classroomCode, String teacherName, String announcementTitle, String content) {
        String subject = String.format("[%s] 📢 Announcement: %s", classroomCode != null ? classroomCode : classroomName, announcementTitle);
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #0284c7, #6366f1); padding: 15px; border-radius: 8px;">
                    <h2 style="color: #ffffff; margin: 0;">Classroom Stream Notice</h2>
                    <p style="color: #e2e8f0; margin: 5px 0 0 0;">From Instructor: %s</p>
                </div>
                <div style="padding: 20px; background-color: #1e293b; margin-top: 15px; border-radius: 8px; border: 1px solid #334155;">
                    <h3 style="color: #38bdf8; margin-top: 0;">%s</h3>
                    <p style="line-height: 1.6; color: #cbd5e1;">%s</p>
                </div>
            </div>
            """.formatted(teacherName != null ? teacherName : "Course Instructor", announcementTitle, content);

        sendHtmlEmail(studentEmail, subject, html);
    }

    /**
     * 2. Assignment Due Today Evening Reminder (6:00 PM Alert)
     */
    public void sendDueTodayReminder(String studentEmail, String classroomName, String assignmentTitle, String dueDate) {
        String subject = String.format("⏰ [Urgent Reminder] Assignment \"%s\" is Due Tonight!", assignmentTitle);
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #eab308, #ca8a04); padding: 15px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">⏰ 6:00 PM Deadline Alert</h2>
                </div>
                <div style="padding: 20px; background-color: #1e293b; margin-top: 15px; border-radius: 8px; border: 1px solid #eab308;">
                    <h3 style="color: #fde047; margin-top: 0;">Course: %s</h3>
                    <p>Your assignment <strong>"%s"</strong> is scheduled for submission <strong>tonight at 11:59 PM</strong>.</p>
                    <p>Current Status: <span style="color: #ef4444; font-weight: bold;">NOT SUBMITTED YET</span></p>
                    <p style="color: #94a3b8;">Log in to your student dashboard now to avoid late penalty points.</p>
                </div>
            </div>
            """.formatted(classroomName, assignmentTitle);

        sendHtmlEmail(studentEmail, subject, html);
    }

    /**
     * 3. Parent Email Notification (Academic Performance Alert / Low Score / Missed Submission)
     */
    public void sendParentAcademicAlert(String parentEmail, String studentName, String classroomName, String assignmentTitle, Double scoreReceived, Double maxMarks, Double minThreshold, String teacherFeedback) {
        String subject = String.format("[Academic Alert] Performance & Evaluation Report for Student: %s", studentName);
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 15px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">🛡️ Guardian Academic Notification</h2>
                    <p style="color: #fef2f2; margin: 5px 0 0 0;">AI-Enabled Classroom Automated Guardian Dispatch</p>
                </div>
                <div style="padding: 20px; background-color: #1e293b; margin-top: 15px; border-radius: 8px; border: 1px solid #ef4444;">
                    <h3 style="color: #fca5a5; margin-top: 0;">Student Name: %s</h3>
                    <p><strong>Course / Subject:</strong> %s</p>
                    <p><strong>Assignment Evaluation:</strong> %s</p>
                    <div style="background-color: #450a0a; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 15px 0;">
                        <p style="margin: 0; color: #fecdd3; font-weight: bold;">Score Obtained: %.1f / %.1f Marks</p>
                        <p style="margin: 5px 0 0 0; color: #fda4af; font-size: 0.9em;">Minimum Passing Threshold: %.1f Marks</p>
                    </div>
                    <p><strong>Instructor Remarks:</strong></p>
                    <p style="font-style: italic; color: #cbd5e1; background-color: #0f172a; padding: 10px; border-radius: 6px;">"%s"</p>
                </div>
            </div>
            """.formatted(studentName, classroomName, assignmentTitle, scoreReceived != null ? scoreReceived : 0.0, maxMarks != null ? maxMarks : 10.0, minThreshold != null ? minThreshold : 5.0, teacherFeedback != null ? teacherFeedback : "Attention required for academic improvement.");

        sendHtmlEmail(parentEmail, subject, html);
    }

    /**
     * 4A. Teacher Pro License Purchase Invoice Email
     */
    public void sendTeacherLicenseInvoice(String teacherEmail, String teacherName, String planTitle, Double amountInr, String invoiceNo, String transactionId) {
        String subject = String.format("[AI Classroom] 🧾 Payment Receipt & Individual Pro License Invoice (%s)", invoiceNo);
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 15px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">🎉 Payment Confirmed & License Unlocked</h2>
                </div>
                <div style="padding: 20px; background-color: #1e293b; margin-top: 15px; border-radius: 8px; border: 1px solid #10b981;">
                    <h3 style="color: #34d399; margin-top: 0;">Billed To: %s (%s)</h3>
                    <p><strong>Invoice Number:</strong> %s</p>
                    <p><strong>Transaction Reference:</strong> %s</p>
                    <p><strong>License Plan:</strong> %s</p>
                    <p><strong>Amount Paid:</strong> <span style="color: #34d399; font-weight: bold; font-size: 1.2em;">₹%.2f INR</span></p>
                    <hr style="border-color: #334155;" />
                    <p style="color: #a7f3d0; font-weight: bold;">Unlocked Features:</p>
                    <ul style="color: #cbd5e1;">
                        <li>Unlimited Classrooms & Students</li>
                        <li>Unlimited Spring AI Rubric Evaluation & Code Grading</li>
                        <li>Multi-Algorithm Plagiarism Detection</li>
                        <li>Parent Guardian Automated Email Alerts</li>
                    </ul>
                </div>
            </div>
            """.formatted(teacherName, teacherEmail, invoiceNo, transactionId, planTitle, amountInr != null ? amountInr : 499.0);

        sendHtmlEmail(teacherEmail, subject, html);
    }

    /**
     * 4B. Teacher License Status Change (Cancellation / Suspension)
     */
    public void sendTeacherLicenseStatusUpdate(String teacherEmail, String teacherName, String status) {
        String subject = String.format("[Status Update] Software License Access %s", status);
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #f43f5e, #be123c); padding: 15px; border-radius: 8px;">
                    <h2 style="color: #ffffff; margin: 0;">Software License Status Alert</h2>
                </div>
                <div style="padding: 20px; background-color: #1e293b; margin-top: 15px; border-radius: 8px;">
                    <p>Hello %s,</p>
                    <p>Your software license access status has been updated to: <strong style="color: #f43f5e;">%s</strong>.</p>
                </div>
            </div>
            """.formatted(teacherName, status);

        sendHtmlEmail(teacherEmail, subject, html);
    }

    /**
     * 5. Institutional B2B Campus License Approved Email (To Institution Contact Person)
     */
    public void sendInstitutionalApprovalNotification(String contactEmail, String contactName, String institutionName, String domainExtension) {
        String subject = String.format("[VERIFIED] 🏛️ Institutional B2B Campus License Approved for @%s", domainExtension);
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 15px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">🏛️ Campus B2B License Verified & Approved</h2>
                </div>
                <div style="padding: 20px; background-color: #1e293b; margin-top: 15px; border-radius: 8px; border: 1px solid #8b5cf6;">
                    <h3 style="color: #c084fc; margin-top: 0;">%s</h3>
                    <p>Attention: <strong>%s</strong> (%s)</p>
                    <p>Your institutional domain extension <strong>@%s</strong> has been officially verified and whitelisted into the AI-Enabled Classroom Enterprise System.</p>
                    <div style="background-color: #311052; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 0; color: #e9d5ff; font-weight: bold;">Whole-Campus Domain Access Active:</p>
                        <p style="margin: 5px 0 0 0; color: #c084fc; font-size: 0.95em;">All faculty & educators registering with <strong>@%s</strong> will automatically receive Enterprise AI software access upon sign in!</p>
                    </div>
                </div>
            </div>
            """.formatted(institutionName, contactName, contactEmail, domainExtension, domainExtension);

        sendHtmlEmail(contactEmail, subject, html);
    }

    /**
     * Password Reset OTP Email Notification
     */
    public void sendPasswordResetOtp(String userEmail, String userName, String otpCode) {
        String subject = "🔐 Security Code: AI Classroom Password Reset OTP";
        String html = """
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 25px; border-radius: 12px; max-width: 520px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px;">AI-Enabled Classroom</h2>
                    <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 14px;">Password Reset Security Request</p>
                </div>
                <div style="padding: 25px; background-color: #1e293b; margin-top: 15px; border-radius: 8px; border: 1px solid #334155; text-align: center;">
                    <p style="color: #cbd5e1; font-size: 15px; margin-top: 0;">Hello <strong>%s</strong>,</p>
                    <p style="color: #94a3b8; font-size: 14px;">We received a request to reset your AI Classroom portal password. Use the 6-digit security code below to complete your password reset:</p>
                    <div style="background: #0f172a; border: 2px dashed #6366f1; border-radius: 10px; padding: 15px; margin: 20px 0; display: inline-block; width: 80%%;">
                        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38bdf8;">%s</span>
                    </div>
                    <p style="color: #f59e0b; font-size: 13px; font-weight: bold;">⚠️ This code expires in 10 minutes. Do not share this OTP with anyone.</p>
                    <hr style="border-color: #334155; margin: 20px 0;" />
                    <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email.</p>
                </div>
            </div>
            """.formatted(userName != null ? userName : "User", otpCode);

        sendHtmlEmail(userEmail, subject, html);
    }
}
