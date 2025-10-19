package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.model.Report;
import com.earacg.earaconnect.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id) {
        return reportService.getReportById(id)
                .map(report -> ResponseEntity.ok(report))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/resolution/{resolutionId}")
    public ResponseEntity<List<Report>> getReportsByResolution(@PathVariable Long resolutionId) {
        return ResponseEntity.ok(reportService.getReportsByResolution(resolutionId));
    }
    
    @GetMapping("/subcommittee/{subcommitteeId}")
    public ResponseEntity<List<Report>> getReportsBySubcommittee(@PathVariable Long subcommitteeId) {
        return ResponseEntity.ok(reportService.getReportsBySubcommittee(subcommitteeId));
    }
    
    @GetMapping("/submitter/{submittedById}")
    public ResponseEntity<List<Report>> getReportsBySubmitter(@PathVariable Long submittedById) {
        return ResponseEntity.ok(reportService.getReportsBySubmitter(submittedById));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Report>> getReportsByStatus(@PathVariable String status) {
        try {
            Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(reportService.getReportsByStatus(reportStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/hod-review/{hodId}")
    public ResponseEntity<List<Report>> getReportsForHodReview(@PathVariable Long hodId) {
        return ResponseEntity.ok(reportService.getReportsForHodReview(hodId));
    }
    
    @GetMapping("/commissioner-review/{commissionerId}")
    public ResponseEntity<List<Report>> getReportsForCommissionerReview(@PathVariable Long commissionerId) {
        return ResponseEntity.ok(reportService.getReportsForCommissionerReview(commissionerId));
    }
    
    @PostMapping
    public ResponseEntity<Report> submitReport(@RequestBody Report report) {
        Report submittedReport = reportService.submitReport(report);
        if (submittedReport != null) {
            return ResponseEntity.ok(submittedReport);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PostMapping("/{reportId}/hod-review")
    public ResponseEntity<Report> reviewByHod(
            @PathVariable Long reportId,
            @RequestBody Map<String, Object> reviewData) {
        
        try {
            System.out.println("🔍 HOD Review Request - reportId: " + reportId + ", reviewData: " + reviewData);
            
            if (reviewData.get("hodId") == null) {
                System.err.println("❌ Missing hodId in request");
                return ResponseEntity.badRequest().body(null);
            }
            if (reviewData.get("approved") == null) {
                System.err.println("❌ Missing approved in request");
                return ResponseEntity.badRequest().body(null);
            }
            
            Long hodId = Long.valueOf(reviewData.get("hodId").toString());
            Boolean approved = Boolean.valueOf(reviewData.get("approved").toString());
            String comments = reviewData.get("comments") != null ? reviewData.get("comments").toString() : "";
            
            System.out.println("🔍 Parsed values - hodId: " + hodId + ", approved: " + approved + ", comments: " + comments);
            
            Report reviewedReport = reportService.reviewByHod(reportId, hodId, approved, comments);
            if (reviewedReport != null) {
                System.out.println("✅ HOD review successful");
                return ResponseEntity.ok(reviewedReport);
            } else {
                System.err.println("❌ HOD review failed - service returned null");
                return ResponseEntity.badRequest().body(null);
            }
        } catch (Exception e) {
            System.err.println("❌ Error in HOD review: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/{reportId}/commissioner-review")
    public ResponseEntity<Report> reviewByCommissioner(
            @PathVariable Long reportId,
            @RequestBody Map<String, Object> reviewData) {
        
        try {
            Long commissionerId = Long.valueOf(reviewData.get("commissionerId").toString());
            Boolean approved = Boolean.valueOf(reviewData.get("approved").toString());
            String comments = reviewData.get("comments") != null ? reviewData.get("comments").toString() : "";
            
            Report reviewedReport = reportService.reviewByCommissioner(reportId, commissionerId, approved, comments);
            if (reviewedReport != null) {
                return ResponseEntity.ok(reviewedReport);
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 