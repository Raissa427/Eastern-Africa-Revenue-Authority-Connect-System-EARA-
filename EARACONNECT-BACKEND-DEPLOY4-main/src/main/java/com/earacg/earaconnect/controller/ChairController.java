package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.model.Report;
import com.earacg.earaconnect.model.Resolution;
import com.earacg.earaconnect.model.User;
import com.earacg.earaconnect.model.SubCommittee;
import com.earacg.earaconnect.service.ChairValidationService;
import com.earacg.earaconnect.service.ReportService;
import com.earacg.earaconnect.service.UserService;
import com.earacg.earaconnect.service.ResolutionService;
import com.earacg.earaconnect.service.SubCommitteeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chair")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class ChairController {

    @Autowired
    private ChairValidationService chairValidationService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserService userService;

    @Autowired
    private ResolutionService resolutionService;

    @Autowired
    private SubCommitteeService subCommitteeService;

    /**
     * Get all resolutions assigned to the Chair's subcommittee
     */
    @GetMapping("/resolutions/{chairId}")
    public ResponseEntity<?> getAssignedResolutions(@PathVariable Long chairId) {
        try {
            // First check if user exists
            var userOpt = userService.getUserById(chairId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found with ID: " + chairId));
            }
            
            User user = userOpt.get();
            System.out.println("🔍 ChairController: User found - ID: " + user.getId() + ", Role: " + user.getRole());
            
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair. Current role: " + user.getRole()));
            }

            List<Resolution> resolutions = chairValidationService.getAssignedResolutions(chairId);
            System.out.println("🔍 ChairController: Found " + resolutions.size() + " resolutions for chair " + chairId);
            return ResponseEntity.ok(resolutions);
        } catch (Exception e) {
            System.err.println("❌ ChairController: Error in getAssignedResolutions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch assigned resolutions: " + e.getMessage()));
        }
    }

    /**
     * Get all resolutions assigned to a specific subcommittee
     */
    @GetMapping("/resolutions/subcommittee/{subcommitteeId}")
    public ResponseEntity<?> getResolutionsBySubcommittee(@PathVariable Long subcommitteeId) {
        try {
            List<Resolution> resolutions = resolutionService.getResolutionsBySubcommittee(subcommitteeId);
            return ResponseEntity.ok(resolutions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch resolutions: " + e.getMessage()));
        }
    }

    /**
     * Get detailed information about a specific resolution
     */
    @GetMapping("/resolutions/{resolutionId}/details")
    public ResponseEntity<?> getResolutionDetails(@PathVariable Long resolutionId, @RequestParam Long chairId) {
        try {
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair"));
            }

            if (!chairValidationService.canAccessResolution(chairId, resolutionId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot access this resolution"));
            }

            var resolutionOpt = resolutionService.getResolutionById(resolutionId);
            if (resolutionOpt.isPresent()) {
                return ResponseEntity.ok(resolutionOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch resolution details: " + e.getMessage()));
        }
    }

    /**
     * Submit a new report
     */
    @PostMapping("/reports")
    public ResponseEntity<?> submitReport(@RequestBody Report report, @RequestParam Long chairId) {
        try {
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair"));
            }

            if (!chairValidationService.canSubmitReport(chairId, report.getResolution().getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot submit report for this resolution"));
            }

            // Validate report data
            List<String> validationErrors = chairValidationService.validateReportData(report);
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "details", validationErrors));
            }

            // Set the submitted by field
            var chairOpt = userService.getUserById(chairId);
            if (chairOpt.isPresent()) {
                report.setSubmittedBy(chairOpt.get());
                report.setStatus(Report.ReportStatus.SUBMITTED);
                
                // Fix for TransientPropertyValueException: Fetch the full SubCommittee entity
                if (report.getSubcommittee() != null && report.getSubcommittee().getId() != null) {
                    var subcommitteeOpt = subCommitteeService.getSubCommitteeById(report.getSubcommittee().getId());
                    if (subcommitteeOpt.isPresent()) {
                        report.setSubcommittee(subcommitteeOpt.get());
                        System.out.println("✅ ChairController: Successfully fetched SubCommittee with ID: " + report.getSubcommittee().getId());
                    } else {
                        System.err.println("❌ ChairController: SubCommittee not found with ID: " + report.getSubcommittee().getId());
                        return ResponseEntity.badRequest().body(Map.of("error", "SubCommittee not found with ID: " + report.getSubcommittee().getId()));
                    }
                } else {
                    System.err.println("❌ ChairController: SubCommittee is null or has no ID");
                    // If subcommittee is null or has null ID, try to get it from the chair's subcommittee
                    if (chairOpt.get().getSubcommittee() != null) {
                        report.setSubcommittee(chairOpt.get().getSubcommittee());
                        System.out.println("✅ ChairController: Using chair's subcommittee: " + chairOpt.get().getSubcommittee().getId());
                    } else {
                        return ResponseEntity.badRequest().body(Map.of("error", "Chair has no assigned subcommittee"));
                    }
                }
                
                Report savedReport = reportService.submitReport(report);
                
                // Add success message for HOD confirmation
                Map<String, Object> response = new HashMap<>();
                response.put("id", savedReport.getId());
                response.put("status", savedReport.getStatus());
                response.put("submittedAt", savedReport.getSubmittedAt());
                response.put("successMessage", "Report submitted successfully! Your report has been sent to HOD for review. Report ID: " + savedReport.getId());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Chair not found"));
            }
        } catch (Exception e) {
            System.err.println("❌ ChairController: Error submitting report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to submit report: " + e.getMessage()));
        }
    }

    /**
     * Get all reports submitted by the Chair
     */
    @GetMapping("/reports/{chairId}")
    public ResponseEntity<?> getChairReports(@PathVariable Long chairId) {
        try {
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair"));
            }

            List<Report> reports = chairValidationService.getChairReports(chairId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch chair reports: " + e.getMessage()));
        }
    }

    /**
     * Update an existing report
     */
    @PutMapping("/reports/{reportId}")
    public ResponseEntity<?> updateReport(@PathVariable Long reportId, @RequestBody Report reportData, @RequestParam Long chairId) {
        try {
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair"));
            }

            if (!chairValidationService.canUpdateReport(chairId, reportId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot update this report"));
            }

            // Validate report data
            List<String> validationErrors = chairValidationService.validateReportData(reportData);
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "details", validationErrors));
            }

            // Fix for TransientPropertyValueException: Fetch the full SubCommittee entity
            if (reportData.getSubcommittee() != null && reportData.getSubcommittee().getId() != null) {
                var subcommitteeOpt = subCommitteeService.getSubCommitteeById(reportData.getSubcommittee().getId());
                if (subcommitteeOpt.isPresent()) {
                    reportData.setSubcommittee(subcommitteeOpt.get());
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "SubCommittee not found with ID: " + reportData.getSubcommittee().getId()));
                }
            } else {
                // If subcommittee is null or has null ID, try to get it from the chair's subcommittee
                var chairOpt = userService.getUserById(chairId);
                if (chairOpt.isPresent() && chairOpt.get().getSubcommittee() != null) {
                    reportData.setSubcommittee(chairOpt.get().getSubcommittee());
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Chair has no assigned subcommittee"));
                }
            }

            Report updatedReport = reportService.updateReport(reportId, reportData);
            if (updatedReport != null) {
                return ResponseEntity.ok(updatedReport);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Report not found or could not be updated"));
            }
        } catch (Exception e) {
            System.err.println("❌ ChairController: Error updating report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update report: " + e.getMessage()));
        }
    }

    /**
     * Get Chair's profile
     */
    @GetMapping("/profile/{chairId}")
    public ResponseEntity<?> getChairProfile(@PathVariable Long chairId) {
        try {
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair"));
            }

            var chairOpt = userService.getUserById(chairId);
            if (chairOpt.isPresent()) {
                return ResponseEntity.ok(chairOpt.get());
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Chair not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch chair profile: " + e.getMessage()));
        }
    }

    /**
     * Update Chair's profile
     */
    @PutMapping("/profile/{chairId}")
    public ResponseEntity<?> updateChairProfile(@PathVariable Long chairId, @RequestBody Map<String, Object> profileData) {
        try {
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair"));
            }

            // Validate that role is not being updated
            if (profileData.containsKey("role")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Role cannot be updated"));
            }

            // For now, we'll return an error since updateUser method doesn't accept Map
            return ResponseEntity.badRequest().body(Map.of("error", "Profile update functionality not implemented yet"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update chair profile: " + e.getMessage()));
        }
    }

    /**
     * Get Chair's subcommittee
     */
    @GetMapping("/subcommittee/{chairId}")
    public ResponseEntity<?> getChairSubcommittee(@PathVariable Long chairId) {
        try {
            if (!chairValidationService.isChair(chairId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Chair"));
            }

            var subcommitteeOpt = chairValidationService.getChairSubcommittee(chairId);
            if (subcommitteeOpt.isPresent()) {
                return ResponseEntity.ok(subcommitteeOpt.get());
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Chair has no assigned subcommittee"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch chair subcommittee: " + e.getMessage()));
        }
    }

    /**
     * Validate Chair permissions for a specific action
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateChairPermissions(@RequestBody Map<String, Object> request) {
        try {
            Long chairId = Long.valueOf(request.get("chairId").toString());
            String action = request.get("action").toString();
            Long resourceId = request.containsKey("resourceId") ? Long.valueOf(request.get("resourceId").toString()) : null;

            Map<String, Object> response = new HashMap<>();
            response.put("isChair", chairValidationService.isChair(chairId));

            switch (action) {
                case "submit_report":
                    if (resourceId != null) {
                        response.put("canSubmit", chairValidationService.canSubmitReport(chairId, resourceId));
                    }
                    break;
                case "access_resolution":
                    if (resourceId != null) {
                        response.put("canAccess", chairValidationService.canAccessResolution(chairId, resourceId));
                    }
                    break;
                case "update_report":
                    if (resourceId != null) {
                        response.put("canUpdate", chairValidationService.canUpdateReport(chairId, resourceId));
                    }
                    break;
                default:
                    response.put("error", "Unknown action");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Validation failed: " + e.getMessage()));
        }
    }

    /**
     * Test endpoint to check database state
     */
    @GetMapping("/test/database")
    public ResponseEntity<?> testDatabase() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Check all users
            List<User> allUsers = userService.getAllUsers();
            result.put("totalUsers", allUsers.size());
            result.put("users", allUsers.stream().map(user -> Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "subcommittee", user.getSubcommittee() != null ? user.getSubcommittee().getName() : "None"
            )).toList());
            
            // Check all resolutions
            List<Resolution> allResolutions = resolutionService.getAllResolutions();
            result.put("totalResolutions", allResolutions.size());
            result.put("resolutions", allResolutions.stream().map(resolution -> Map.of(
                "id", resolution.getId(),
                "title", resolution.getTitle(),
                "status", resolution.getStatus(),
                "assignments", resolution.getAssignments() != null ? resolution.getAssignments().size() : 0
            )).toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to test database: " + e.getMessage()));
        }
    }
}
