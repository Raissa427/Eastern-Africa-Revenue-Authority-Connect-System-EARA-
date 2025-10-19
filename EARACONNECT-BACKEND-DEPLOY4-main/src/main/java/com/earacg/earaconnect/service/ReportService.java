package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.*;
import com.earacg.earaconnect.repository.ReportRepo;
import com.earacg.earaconnect.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {
    
    @Autowired
    private ReportRepo reportRepo;
    
    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private HODPermissionService hodPermissionService;
    
    public List<Report> getAllReports() {
        return reportRepo.findAll();
    }
    
    public Optional<Report> getReportById(Long id) {
        return reportRepo.findById(id);
    }
    
    public List<Report> getReportsByResolution(Long resolutionId) {
        return reportRepo.findByResolutionId(resolutionId);
    }
    
    public List<Report> getReportsBySubcommittee(Long subcommitteeId) {
        return reportRepo.findBySubcommitteeId(subcommitteeId);
    }
    
    public List<Report> getReportsBySubmitter(Long submittedById) {
        return reportRepo.findBySubmittedById(submittedById);
    }
    
    public List<Report> getReportsByStatus(Report.ReportStatus status) {
        return reportRepo.findByStatus(status);
    }
    
    public List<Report> getReportsForHodReview(Long hodId) {
        return reportRepo.findByReviewedByHodId(hodId);
    }
    
    public List<Report> getReportsForCommissionerReview(Long commissionerId) {
        return reportRepo.findByReviewedByCommissionerId(commissionerId);
    }
    
    public Report submitReport(Report report) {
        report.setStatus(Report.ReportStatus.SUBMITTED);
        report.setSubmittedAt(LocalDateTime.now());
        
        Report savedReport = reportRepo.save(report);
        
        // Notify HODs about new report submission
        notifyHodsAboutReport(savedReport);
        
        return savedReport;
    }
    
    public Report reviewByHod(Long reportId, Long hodId, boolean approved, String comments) {
        System.out.println("🔍 ReportService.reviewByHod - reportId: " + reportId + ", hodId: " + hodId + ", approved: " + approved);
        
        Optional<Report> reportOpt = reportRepo.findById(reportId);
        if (reportOpt.isEmpty()) {
            System.err.println("❌ Report not found with ID: " + reportId);
            return null;
        }
        
        Report report = reportOpt.get();
        System.out.println("✅ Found report: " + report.getId() + " with status: " + report.getStatus());
        
        Optional<User> hodOpt = userRepo.findById(hodId);
        if (hodOpt.isEmpty()) {
            System.err.println("❌ HOD user not found with ID: " + hodId);
            return null;
        }
        
        User hod = hodOpt.get();
        System.out.println("✅ Found HOD user: " + hod.getName() + " with role: " + hod.getRole());
        
        // Validate that the user has HOD privileges
        boolean hasHODPrivileges = hodPermissionService.hasHODPrivileges(hod);
        System.out.println("🔍 HOD privileges check: " + hasHODPrivileges);
        
        if (hasHODPrivileges) {
            report.setReviewedByHod(hod);
            report.setHodComments(comments);
            report.setHodReviewedAt(LocalDateTime.now());
            
            if (approved) {
                report.setStatus(Report.ReportStatus.APPROVED_BY_HOD);
                System.out.println("✅ Report APPROVED by HOD");
                // Forward to Commissioner General
                notifyCommissionerAboutReport(report);
                // Notify Chair about approval
                notifyChairAboutApproval(report);
            } else {
                report.setStatus(Report.ReportStatus.REJECTED_BY_HOD);
                System.out.println("❌ Report REJECTED by HOD");
                // Notify Chair about rejection
                notifyChairAboutRejection(report);
            }
            
            Report savedReport = reportRepo.save(report);
            System.out.println("✅ Report saved with new status: " + savedReport.getStatus());
            return savedReport;
        } else {
            System.err.println("❌ User " + hod.getName() + " does not have HOD privileges");
            return null;
        }
    }
    
    public Report reviewByCommissioner(Long reportId, Long commissionerId, boolean approved, String comments) {
        Optional<Report> reportOpt = reportRepo.findById(reportId);
        if (reportOpt.isPresent()) {
            Report report = reportOpt.get();
            User commissioner = userRepo.findById(commissionerId).orElse(null);
            
            if (commissioner != null) {
                report.setReviewedByCommissioner(commissioner);
                report.setCommissionerComments(comments);
                report.setCommissionerReviewedAt(LocalDateTime.now());
                
                if (approved) {
                    report.setStatus(Report.ReportStatus.APPROVED_BY_COMMISSIONER);
                } else {
                    report.setStatus(Report.ReportStatus.REJECTED_BY_COMMISSIONER);
                }
                
                return reportRepo.save(report);
            }
        }
        return null;
    }
    
    /**
     * Update an existing report (for resubmission after rejection)
     */
    public Report updateReport(Long reportId, Report reportDetails) {
        Optional<Report> reportOpt = reportRepo.findById(reportId);
        if (reportOpt.isPresent()) {
            Report report = reportOpt.get();
            
            // Update report details
            report.setProgressDetails(reportDetails.getProgressDetails());
            report.setHindrances(reportDetails.getHindrances());
            report.setPerformancePercentage(reportDetails.getPerformancePercentage());
            report.setSubmittedAt(LocalDateTime.now());
            
            // Reset review status for resubmission
            report.setStatus(Report.ReportStatus.SUBMITTED);
            report.setReviewedByHod(null);
            report.setHodComments(null);
            report.setHodReviewedAt(null);
            report.setReviewedByCommissioner(null);
            report.setCommissionerComments(null);
            report.setCommissionerReviewedAt(null);
            
            Report savedReport = reportRepo.save(report);
            
            // Notify HODs about resubmitted report
            notifyHodsAboutReport(savedReport);
            
            return savedReport;
        }
        return null;
    }
    
    private void notifyHodsAboutReport(Report report) {
        // Get all Chair/Vice Chair users (no direct HOD role exists)
        List<User> chairs = userRepo.findByRole(User.UserRole.CHAIR);
        List<User> viceChairs = userRepo.findByRole(User.UserRole.VICE_CHAIR);
        
        // Combine all potential HOD users
        List<User> allPotentialHods = new java.util.ArrayList<>(chairs);
        allPotentialHods.addAll(viceChairs);
        
        // Filter and notify only those with HOD privileges (Chair/Vice Chair of Head of Delegation)
        for (User user : allPotentialHods) {
            if (hodPermissionService.hasHODPrivileges(user)) {
                // Create in-app notification
                notificationService.createNotification(
                    user.getId(),
                    "New Report Submission",
                    "A new report has been submitted for '" + report.getResolution().getTitle() + "' by " + report.getSubmittedBy().getName(),
                    Notification.NotificationType.REPORT_SUBMISSION,
                    "Report",
                    report.getId()
                );
                
                // Send email notification
                try {
                    emailService.sendReportNotification(
                        user.getEmail(),
                        user.getName(),
                        report.getResolution().getTitle(),
                        "submitted for your review"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to send email to HOD " + user.getEmail() + ": " + e.getMessage());
                }
            }
        }
    }
    
    private void notifyCommissionerAboutReport(Report report) {
        List<User> commissioners = userRepo.findByRole(User.UserRole.COMMISSIONER_GENERAL);
        for (User commissioner : commissioners) {
            // Create in-app notification
            notificationService.createNotification(
                commissioner.getId(),
                "Report Approved by HOD",
                "A report for '" + report.getResolution().getTitle() + "' has been approved by HOD and forwarded for final review",
                Notification.NotificationType.REPORT_APPROVAL,
                "Report",
                report.getId()
            );
            
            // Send email notification
            try {
                emailService.sendReportNotification(
                    commissioner.getEmail(),
                    commissioner.getName(),
                    report.getResolution().getTitle(),
                    "approved by HOD and forwarded for final review"
                );
            } catch (Exception e) {
                System.err.println("Failed to send email to Commissioner " + commissioner.getEmail() + ": " + e.getMessage());
            }
        }
    }
    
    private void notifyChairAboutRejection(Report report) {
        User chair = report.getSubmittedBy();
        
        // Create in-app notification
        notificationService.createNotification(
            chair.getId(),
            "Report Rejected",
            "Your report for '" + report.getResolution().getTitle() + "' has been rejected. Comments: " + report.getHodComments(),
            Notification.NotificationType.REPORT_REJECTION,
            "Report",
            report.getId()
        );
        
        // Send email notification
        try {
            emailService.sendReportRejectionNotification(
                chair.getEmail(),
                chair.getName(),
                report.getResolution().getTitle(),
                report.getHodComments(),
                report.getReviewedByHod().getName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send rejection email to Chair " + chair.getEmail() + ": " + e.getMessage());
        }
    }
    
    private void notifyChairAboutApproval(Report report) {
        User chair = report.getSubmittedBy();
        
        // Create in-app notification
        notificationService.createNotification(
            chair.getId(),
            "Report Approved",
            "Your report for '" + report.getResolution().getTitle() + "' has been approved and forwarded to Commissioner General",
            Notification.NotificationType.REPORT_APPROVAL,
            "Report",
            report.getId()
        );
        
        // Send email notification
        try {
            emailService.sendReportApprovalNotification(
                chair.getEmail(),
                chair.getName(),
                report.getResolution().getTitle(),
                report.getHodComments(),
                report.getReviewedByHod().getName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send approval email to Chair " + chair.getEmail() + ": " + e.getMessage());
        }
    }
} 