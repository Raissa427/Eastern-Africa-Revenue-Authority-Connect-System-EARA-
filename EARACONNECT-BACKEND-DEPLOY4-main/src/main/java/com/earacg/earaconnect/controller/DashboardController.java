package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    // NEW ENDPOINTS FOR SIMPLE PERFORMANCE DASHBOARD
    @GetMapping("/available-years")
    public ResponseEntity<List<Integer>> getAvailableYears() {
        try {
            List<Integer> years = dashboardService.getAvailableYears();
            return ResponseEntity.ok(years);
        } catch (Exception e) {
            e.printStackTrace();
            // Return default years if error occurs
            return ResponseEntity.ok(List.of(2024, 2023, 2022));
        }
    }
    
    @GetMapping("/performance/simple")
    public ResponseEntity<Map<String, Object>> getSimplePerformanceData(@RequestParam Integer year) {
        try {
            Map<String, Object> dashboardData = dashboardService.getSimplePerformanceData(year);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }
    
    // EXISTING ENDPOINTS
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceDashboard(
            @RequestParam(required = false, defaultValue = "3months") String timeFilter,
            @RequestParam(required = false, defaultValue = "all") String subcommittee,
            @RequestParam(required = false) Long userId) {
        
        try {
            Map<String, Object> dashboardData = dashboardService.getPerformanceDashboardData(timeFilter, subcommittee, userId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/performance/stats")
    public ResponseEntity<Map<String, Object>> getPerformanceStats(
            @RequestParam(required = false) Long hodId,
            @RequestParam(required = false) Long commissionerId) {
        
        try {
            Map<String, Object> stats = dashboardService.getPerformanceStats(hodId, commissionerId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/subcommittee-performance")
    public ResponseEntity<Map<String, Object>> getSubcommitteePerformance(
            @RequestParam(required = false, defaultValue = "3months") String timeFilter) {
        
        try {
            Map<String, Object> performance = dashboardService.getSubcommitteePerformanceData(timeFilter);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/resolution-progress")
    public ResponseEntity<Map<String, Object>> getResolutionProgress() {
        try {
            Map<String, Object> progress = dashboardService.getResolutionProgressData();
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/monthly-trends")
    public ResponseEntity<Map<String, Object>> getMonthlyTrends(
            @RequestParam(required = false, defaultValue = "6") Integer months) {
        
        try {
            Map<String, Object> trends = dashboardService.getMonthlyTrendsData(months);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}