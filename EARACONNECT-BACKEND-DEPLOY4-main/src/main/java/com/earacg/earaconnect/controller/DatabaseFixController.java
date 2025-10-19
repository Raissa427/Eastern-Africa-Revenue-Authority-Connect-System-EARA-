package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.service.DatabaseFixService;
import com.earacg.earaconnect.service.DatabaseTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/database-fixes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DatabaseFixController {

    private final DatabaseFixService databaseFixService;
    private final DatabaseTestService databaseTestService;

    /**
     * Generate a report of all database integrity issues
     */
    @GetMapping("/report")
    public ResponseEntity<?> generateIntegrityReport() {
        try {
            DatabaseFixService.DatabaseIntegrityReport report = databaseFixService.generateIntegrityReport();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "report", report.toString(),
                "hasIssues", report.hasIssues()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to generate integrity report: " + e.getMessage()
            ));
        }
    }

    /**
     * Fix NULL user_role entries in csub_committee_members table
     */
    @PostMapping("/fix-user-roles")
    public ResponseEntity<?> fixNullUserRoles() {
        try {
            databaseFixService.fixNullUserRoles();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully fixed NULL user_role entries"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fix user roles: " + e.getMessage()
            ));
        }
    }

    /**
     * Fix is_first_login flags for users
     */
    @PostMapping("/fix-first-login")
    public ResponseEntity<?> fixFirstLoginFlags() {
        try {
            databaseFixService.fixFirstLoginFlags();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully fixed first login flags"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fix first login flags: " + e.getMessage()
            ));
        }
    }

    /**
     * Run all automatic fixes
     */
    @PostMapping("/auto-fix-all")
    public ResponseEntity<?> autoFixAll() {
        try {
            databaseFixService.autoFixMissingData();
            
            // Generate a report after fixes
            DatabaseFixService.DatabaseIntegrityReport report = databaseFixService.generateIntegrityReport();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Auto-fix completed successfully",
                "postFixReport", report.toString(),
                "remainingIssues", report.hasIssues()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Auto-fix failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Run comprehensive database tests
     */
    @GetMapping("/test")
    public ResponseEntity<?> runDatabaseTests() {
        try {
            DatabaseTestService.DatabaseTestResult testResult = databaseTestService.runAllTests();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "testResults", testResult.toString(),
                "totalTests", testResult.getTestCases().size(),
                "passedTests", testResult.getPassedCount(),
                "failedTests", testResult.getFailedCount(),
                "allPassed", testResult.getFailedCount() == 0
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to run database tests: " + e.getMessage()
            ));
        }
    }
}