// 1. First, let's enhance your EmailService with better error handling and logging

package com.earacg.earaconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;

@Service
@Slf4j
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendCredentials(String email, String name, String password) {
        try {
            log.info("Attempting to send credentials email to: {}", email);
            log.info("From email configured as: {}", fromEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail); // Explicitly set the from address
            message.setTo(email);
            message.setSubject("Your EaraConnect System Credentials");
            message.setText("Dear " + name + ",\n\n" +
                    "Your account has been created in the EaraConnect System.\n\n" +
                    "Your login credentials are:\n" +
                    "Email: " + email + "\n" +
                    "Password: " + password + "\n\n" +
                    "Please change your password after your first login.\n\n" +
                    "Best regards,\n" +
                    "EaraConnect System Team");
            
            // Test the mail sender configuration
            log.info("Mail sender host: {}", mailSender.toString());
            
            mailSender.send(message);
            log.info("✅ Credentials email sent successfully to: {} from: {}", email, fromEmail);
            
        } catch (MailException e) {
            log.error("❌ MailException occurred while sending credentials email to: {}", email, e);
            log.error("Mail exception details: {}", e.getMessage());
            throw new RuntimeException("Failed to send credentials email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error occurred while sending credentials email to: {}", email, e);
            throw new RuntimeException("Failed to send credentials email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send Commissioner General credentials with professional template
     */
    public void sendCommissionerGeneralCredentials(String email, String name, String password) {
        try {
            log.info("Attempting to send Commissioner General credentials email to: {}", email);
            log.info("From email configured as: {}", fromEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Welcome to EaraConnect - Your Commissioner General Account Credentials");
            message.setText("Dear Commissioner General " + name + ",\n\n" +
                    "Welcome to the EaraConnect Committee Management System!\n\n" +
                    "Your account has been successfully created with Commissioner General privileges.\n\n" +
                    "🔐 **Your Login Credentials:**\n" +
                    "📧 Email: " + email + "\n" +
                    "🔑 Password: " + password + "\n\n" +
                    "🌐 **System Access:**\n" +
                    "• Login URL: http://localhost:3000/login\n" +
                    "• Access all Commissioner General features\n" +
                    "• Manage committees and subcommittees\n" +
                    "• Review reports and resolutions\n\n" +
                    "⚠️ **Security Notice:**\n" +
                    "• Please change your password after your first login\n" +
                    "• Keep your credentials secure and confidential\n" +
                    "• Contact system administrator if you need assistance\n\n" +
                    "Best regards,\n" +
                    "EaraConnect System Administration Team\n" +
                    "Committee Management System");
            
            mailSender.send(message);
            log.info("✅ Commissioner General credentials email sent successfully to: {} from: {}", email, fromEmail);
            
        } catch (MailException e) {
            log.error("❌ MailException occurred while sending Commissioner General credentials email to: {}", email, e);
            log.error("Mail exception details: {}", e.getMessage());
            throw new RuntimeException("Failed to send Commissioner General credentials email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error occurred while sending Commissioner General credentials email to: {}", email, e);
            throw new RuntimeException("Failed to send Commissioner General credentials email: " + e.getMessage(), e);
        }
    }
    
    public void sendMeetingInvitation(String email, String name, String meetingTitle, String meetingDate, String location) {
        try {
            log.info("Attempting to send meeting invitation email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail); // Explicitly set the from address
            message.setTo(email);
            message.setSubject("Meeting Invitation: " + meetingTitle);
            message.setText("Dear " + name + ",\n\n" +
                    "You are invited to attend the following meeting:\n\n" +
                    "Title: " + meetingTitle + "\n" +
                    "Date: " + meetingDate + "\n" +
                    "Location: " + location + "\n\n" +
                    "Please confirm your attendance through the EaraConnect system.\n\n" +
                    "Best regards,\n" +
                    "EaraConnect System Team");
            
            mailSender.send(message);
            log.info("✅ Meeting invitation email sent successfully to: {}", email);
            
        } catch (MailException e) {
            log.error("❌ MailException occurred while sending meeting invitation to: {}", email, e);
            throw new RuntimeException("Failed to send meeting invitation email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error occurred while sending meeting invitation to: {}", email, e);
            throw new RuntimeException("Failed to send meeting invitation email: " + e.getMessage(), e);
        }
    }
    
    public void sendReportNotification(String email, String name, String reportTitle, String status) {
        try {
            log.info("Attempting to send report notification email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Report Status Update: " + reportTitle);
            message.setText("Dear " + name + ",\n\n" +
                    "A report for '" + reportTitle + "' has been " + status + ".\n\n" +
                    "Please check the EaraConnect system for more details.\n\n" +
                    "Best regards,\n" +
                    "EaraConnect System Team");
            
            mailSender.send(message);
            log.info("✅ Report notification email sent successfully to: {}", email);
            
        } catch (MailException e) {
            log.error("❌ MailException occurred while sending report notification to: {}", email, e);
            throw new RuntimeException("Failed to send report notification email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error occurred while sending report notification to: {}", email, e);
            throw new RuntimeException("Failed to send report notification email: " + e.getMessage(), e);
        }
    }
    
    public void sendReportRejectionNotification(String email, String name, String reportTitle, String comments, String reviewerName) {
        try {
            log.info("Attempting to send report rejection email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Report Rejected: " + reportTitle);
            message.setText("Dear " + name + ",\n\n" +
                    "Your report for '" + reportTitle + "' has been rejected by " + reviewerName + ".\n\n" +
                    "Review Comments:\n" + comments + "\n\n" +
                    "Please address the feedback and resubmit your report through the EaraConnect system.\n\n" +
                    "Best regards,\n" +
                    "EaraConnect System Team");
            
            mailSender.send(message);
            log.info("✅ Report rejection email sent successfully to: {}", email);
            
        } catch (MailException e) {
            log.error("❌ MailException occurred while sending report rejection email to: {}", email, e);
            throw new RuntimeException("Failed to send report rejection email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error occurred while sending report rejection email to: {}", email, e);
            throw new RuntimeException("Failed to send report rejection email: " + e.getMessage(), e);
        }
    }
    
    public void sendReportApprovalNotification(String email, String name, String reportTitle, String comments, String reviewerName) {
        try {
            log.info("Attempting to send report approval email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Report Approved: " + reportTitle);
            message.setText("Dear " + name + ",\n\n" +
                    "Congratulations! Your report for '" + reportTitle + "' has been approved by " + reviewerName + ".\n\n" +
                    (comments != null && !comments.trim().isEmpty() ? "Review Comments:\n" + comments + "\n\n" : "") +
                    "Your report has been forwarded to the Commissioner General for final review.\n\n" +
                    "You can track the progress through the EaraConnect system.\n\n" +
                    "Best regards,\n" +
                    "EaraConnect System Team");
            
            mailSender.send(message);
            log.info("✅ Report approval email sent successfully to: {}", email);
            
        } catch (MailException e) {
            log.error("❌ MailException occurred while sending report approval email to: {}", email, e);
            throw new RuntimeException("Failed to send report approval email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error occurred while sending report approval email to: {}", email, e);
            throw new RuntimeException("Failed to send report approval email: " + e.getMessage(), e);
        }
    }
    
    public void sendGeneralNotification(String email, String name, String title, String message) {
        try {
            log.info("Attempting to send general notification email to: {}", email);
            
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(email);
            mailMessage.setSubject(title);
            mailMessage.setText("Dear " + name + ",\n\n" + message + "\n\n" +
                    "Best regards,\n" +
                    "EaraConnect System Team");
            
            mailSender.send(mailMessage);
            log.info("✅ General notification email sent successfully to: {}", email);
            
        } catch (MailException e) {
            log.error("❌ MailException occurred while sending general notification to: {}", email, e);
            throw new RuntimeException("Failed to send general notification email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error occurred while sending general notification to: {}", email, e);
            throw new RuntimeException("Failed to send general notification email: " + e.getMessage(), e);
        }
    }
    
    // Add a test method to verify email configuration
    public boolean testEmailConfiguration() {
        try {
            log.info("Testing email configuration...");
            
            SimpleMailMessage testMessage = new SimpleMailMessage();
            testMessage.setFrom(fromEmail);
            testMessage.setTo(fromEmail); // Send test email to yourself
            testMessage.setSubject("EaraConnect Email Configuration Test");
            testMessage.setText("This is a test email to verify that your EaraConnect email configuration is working correctly.\n\n" +
                    "If you receive this email, your email setup is functioning properly.\n\n" +
                    "Timestamp: " + java.time.LocalDateTime.now());
            
            mailSender.send(testMessage);
            log.info("✅ Test email sent successfully!");
            return true;
            
        } catch (Exception e) {
            log.error("❌ Email configuration test failed: {}", e.getMessage(), e);
            return false;
        }
    }
}