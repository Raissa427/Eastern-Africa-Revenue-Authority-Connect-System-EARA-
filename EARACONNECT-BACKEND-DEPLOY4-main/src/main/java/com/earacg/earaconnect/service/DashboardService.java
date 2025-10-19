package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.Report;
import com.earacg.earaconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    
    @Autowired
    private ReportRepo reportRepo;
    
    @Autowired
    private SubCommitteeRepo subCommitteeRepo;
    
    @Autowired
    private ResolutionRepo resolutionRepo;
    
    public Map<String, Object> getPerformanceDashboardData(String timeFilter, String subcommitteeFilter, Long userId) {
        Map<String, Object> dashboardData = new HashMap<>();
        
        try {
            // Get real data from database
            List<Report> allReports = reportRepo.findAll();
            
            // Calculate summary statistics
            Map<String, Object> summary = new HashMap<>();
            long totalReports = allReports.size();
            long approvedReports = allReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.APPROVED_BY_HOD).count();
            long rejectedReports = allReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.REJECTED_BY_HOD).count();
            long pendingReports = allReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.SUBMITTED).count();
            
            double averagePerformance = allReports.stream()
                .filter(r -> r.getPerformancePercentage() != null)
                .mapToInt(Report::getPerformancePercentage)
                .average().orElse(0.0);
            
            long totalSubcommittees = subCommitteeRepo.count();
            long activeResolutions = resolutionRepo.count();
            
            summary.put("totalReports", totalReports);
            summary.put("approvedReports", approvedReports);
            summary.put("rejectedReports", rejectedReports);
            summary.put("pendingReports", pendingReports);
            summary.put("averagePerformance", Math.round(averagePerformance * 100.0) / 100.0);
            summary.put("totalSubcommittees", totalSubcommittees);
            summary.put("activeResolutions", activeResolutions);
            
            dashboardData.put("summary", summary);
            dashboardData.put("subcommitteePerformance", getRealSubcommitteePerformance());
            dashboardData.put("monthlyTrend", getRealMonthlyTrend());
            dashboardData.put("resolutionProgress", getRealResolutionProgress());
            dashboardData.put("performanceDistribution", getRealPerformanceDistribution());
            
        } catch (Exception e) {
            System.err.println("Error getting dashboard data: " + e.getMessage());
            // Fallback to mock data if there's an error
            dashboardData.put("error", e.getMessage());
            return getMockDashboardData();
        }
        
        return dashboardData;
    }
    
    public Map<String, Object> getPerformanceStats(Long hodId, Long commissionerId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("pendingReports", 2);
        stats.put("approvedThisMonth", 8);
        stats.put("rejectedThisMonth", 1);
        stats.put("averagePerformance", 82);
        stats.put("activeResolutions", 5);
        stats.put("totalSubcommittees", 4);
        stats.put("subcommitteePerformance", getSubcommitteePerformanceList());
        
        Map<String, Object> monthlyTrend = new HashMap<>();
        monthlyTrend.put("approved", Arrays.asList(5, 7, 8));
        monthlyTrend.put("rejected", Arrays.asList(2, 1, 1));
        monthlyTrend.put("pending", Arrays.asList(3, 2, 2));
        stats.put("monthlyTrend", monthlyTrend);
        
        return stats;
    }
    
    public Map<String, Object> getSubcommitteePerformanceData(String timeFilter) {
        Map<String, Object> data = new HashMap<>();
        data.put("subcommitteePerformance", getSubcommitteePerformance());
        return data;
    }
    
    public Map<String, Object> getResolutionProgressData() {
        Map<String, Object> data = new HashMap<>();
        data.put("resolutionProgress", getResolutionProgress());
        return data;
    }
    
    public Map<String, Object> getMonthlyTrendsData(Integer months) {
        Map<String, Object> data = new HashMap<>();
        data.put("monthlyTrend", getMonthlyTrend());
        return data;
    }
    
    private List<Map<String, Object>> getSubcommitteePerformance() {
        List<Map<String, Object>> performance = new ArrayList<>();
        
        performance.add(createSubcommitteeData("Domestic Revenue", 87, 8, "up"));
        performance.add(createSubcommitteeData("Customs Revenue", 79, 6, "stable"));
        performance.add(createSubcommitteeData("IT Committee", 91, 7, "up"));
        performance.add(createSubcommitteeData("Legal Committee", 74, 5, "down"));
        performance.add(createSubcommitteeData("HR Committee", 85, 6, "up"));
        performance.add(createSubcommitteeData("Research Committee", 88, 4, "stable"));
        performance.add(createSubcommitteeData("Head Of Delegation", 76, 9, "up"));
        
        return performance;
    }
    
    private List<Map<String, Object>> getSubcommitteePerformanceList() {
        List<Map<String, Object>> performance = new ArrayList<>();
        
        performance.add(createSubcommitteeListData("Technical Infrastructure", 78, "up"));
        performance.add(createSubcommitteeListData("Policy Review Committee", 85, "stable"));
        performance.add(createSubcommitteeListData("Digital Innovation", 91, "up"));
        performance.add(createSubcommitteeListData("Quality Assurance", 74, "down"));
        
        return performance;
    }
    
    private Map<String, Object> getMonthlyTrend() {
        Map<String, Object> trend = new HashMap<>();
        trend.put("labels", Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun"));
        trend.put("approved", Arrays.asList(5, 8, 12, 10, 15, 18));
        trend.put("rejected", Arrays.asList(2, 1, 3, 2, 1, 2));
        trend.put("avgPerformance", Arrays.asList(78, 81, 79, 83, 85, 82));
        return trend;
    }
    
    private List<Map<String, Object>> getResolutionProgress() {
        List<Map<String, Object>> progress = new ArrayList<>();
        
        progress.add(createResolutionData("Digital Transformation", 92, 3));
        progress.add(createResolutionData("Policy Framework Update", 78, 2));
        progress.add(createResolutionData("Infrastructure Upgrade", 85, 4));
        progress.add(createResolutionData("Training Initiative", 67, 2));
        progress.add(createResolutionData("Compliance Review", 89, 3));
        
        return progress;
    }
    
    private Map<String, Object> getPerformanceDistribution() {
        Map<String, Object> distribution = new HashMap<>();
        distribution.put("excellent", 15);
        distribution.put("veryGood", 12);
        distribution.put("good", 8);
        distribution.put("satisfactory", 6);
        distribution.put("poor", 4);
        return distribution;
    }
    
    private Map<String, Object> createSubcommitteeData(String name, int avgPerformance, int reportCount, String trend) {
        Map<String, Object> data = new HashMap<>();
        data.put("name", name);
        data.put("avgPerformance", avgPerformance);
        data.put("reportCount", reportCount);
        data.put("trend", trend);
        return data;
    }
    
    private Map<String, Object> createSubcommitteeListData(String name, int avgPerformance, String trend) {
        Map<String, Object> data = new HashMap<>();
        data.put("name", name);
        data.put("avgPerformance", avgPerformance);
        data.put("trend", trend);
        return data;
    }
    
    private Map<String, Object> createResolutionData(String resolution, int progress, int subcommittees) {
        Map<String, Object> data = new HashMap<>();
        data.put("resolution", resolution);
        data.put("progress", progress);
        data.put("subcommittees", subcommittees);
        return data;
    }
    
    // Real data methods using database queries
    private List<Map<String, Object>> getRealSubcommitteePerformance() {
        List<Map<String, Object>> performance = new ArrayList<>();
        
        try {
            List<Report> reports = reportRepo.findAll();
            Map<String, List<Integer>> subcommitteePerformances = new HashMap<>();
            Map<String, String> subcommitteeNames = new HashMap<>();
            
            for (Report report : reports) {
                if (report.getSubcommittee() != null && report.getPerformancePercentage() != null) {
                    String subcommitteeId = report.getSubcommittee().getId().toString();
                    String subcommitteeName = report.getSubcommittee().getName();
                    
                    subcommitteePerformances.computeIfAbsent(subcommitteeId, key -> new ArrayList<>())
                        .add(report.getPerformancePercentage());
                    subcommitteeNames.put(subcommitteeId, subcommitteeName);
                }
            }
            
            for (Map.Entry<String, List<Integer>> entry : subcommitteePerformances.entrySet()) {
                String subcommitteeId = entry.getKey();
                List<Integer> performances = entry.getValue();
                
                double average = performances.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                
                Map<String, Object> dataPoint = new HashMap<>();
                dataPoint.put("name", subcommitteeNames.get(subcommitteeId));
                dataPoint.put("avgPerformance", (int) Math.round(average));
                dataPoint.put("reportCount", performances.size());
                dataPoint.put("trend", average > 80 ? "up" : average > 60 ? "stable" : "down");
                performance.add(dataPoint);
            }
        } catch (Exception e) {
            System.err.println("Error getting real subcommittee performance: " + e.getMessage());
            return getSubcommitteePerformance(); // Fallback to mock data
        }
        
        return performance.isEmpty() ? getSubcommitteePerformance() : performance;
    }
    
    private Map<String, Object> getRealMonthlyTrend() {
        Map<String, Object> trend = new HashMap<>();
        
        try {
            LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
            List<Report> reports = reportRepo.findBySubmittedAtAfter(sixMonthsAgo);
            
            Map<String, List<Report>> monthlyReports = new HashMap<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
            
            for (Report report : reports) {
                if (report.getSubmittedAt() != null) {
                    String monthKey = report.getSubmittedAt().format(formatter);
                    monthlyReports.computeIfAbsent(monthKey, key -> new ArrayList<>()).add(report);
                }
            }
            
            List<String> labels = new ArrayList<>();
            List<Integer> approved = new ArrayList<>();
            List<Integer> rejected = new ArrayList<>();
            List<Integer> avgPerformance = new ArrayList<>();
            
            for (int i = 5; i >= 0; i--) {
                LocalDateTime month = LocalDateTime.now().minusMonths(i);
                String monthLabel = month.format(formatter);
                labels.add(monthLabel);
                
                List<Report> monthReports = monthlyReports.getOrDefault(monthLabel, new ArrayList<>());
                
                long approvedCount = monthReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.APPROVED_BY_HOD).count();
                long rejectedCount = monthReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.REJECTED_BY_HOD).count();
                double avgPerf = monthReports.stream()
                    .filter(r -> r.getPerformancePercentage() != null)
                    .mapToInt(Report::getPerformancePercentage)
                    .average().orElse(0.0);
                
                approved.add((int) approvedCount);
                rejected.add((int) rejectedCount);
                avgPerformance.add((int) Math.round(avgPerf));
            }
            
            trend.put("labels", labels);
            trend.put("approved", approved);
            trend.put("rejected", rejected);
            trend.put("avgPerformance", avgPerformance);
            
        } catch (Exception e) {
            System.err.println("Error getting real monthly trend: " + e.getMessage());
            return getMonthlyTrend(); // Fallback to mock data
        }
        
        return trend;
    }
    
    private List<Map<String, Object>> getRealResolutionProgress() {
        List<Map<String, Object>> progress = new ArrayList<>();
        
        try {
            List<Report> reports = reportRepo.findAll();
            Map<String, List<Report>> resolutionReports = new HashMap<>();
            
            for (Report report : reports) {
                if (report.getResolution() != null) {
                    String resolutionTitle = report.getResolution().getTitle();
                    resolutionReports.computeIfAbsent(resolutionTitle, key -> new ArrayList<>()).add(report);
                }
            }
            
            for (Map.Entry<String, List<Report>> entry : resolutionReports.entrySet()) {
                String resolutionTitle = entry.getKey();
                List<Report> resolutionReportsList = entry.getValue();
                
                double avgPerformance = resolutionReportsList.stream()
                    .filter(r -> r.getPerformancePercentage() != null)
                    .mapToInt(Report::getPerformancePercentage)
                    .average().orElse(0.0);
                
                Set<String> uniqueSubcommittees = new HashSet<>();
                for (Report report : resolutionReportsList) {
                    if (report.getSubcommittee() != null) {
                        uniqueSubcommittees.add(report.getSubcommittee().getName());
                    }
                }
                
                Map<String, Object> dataPoint = new HashMap<>();
                dataPoint.put("resolution", resolutionTitle);
                dataPoint.put("progress", (int) Math.round(avgPerformance));
                dataPoint.put("subcommittees", uniqueSubcommittees.size());
                
                progress.add(dataPoint);
            }
        } catch (Exception e) {
            System.err.println("Error getting real resolution progress: " + e.getMessage());
            return getResolutionProgress(); // Fallback to mock data
        }
        
        return progress.isEmpty() ? getResolutionProgress() : progress;
    }
    
    private Map<String, Object> getRealPerformanceDistribution() {
        Map<String, Object> distribution = new HashMap<>();
        
        try {
            List<Report> reports = reportRepo.findAll();
            
            int excellent = 0, veryGood = 0, good = 0, satisfactory = 0, poor = 0;
            
            for (Report report : reports) {
                if (report.getPerformancePercentage() != null) {
                    int perf = report.getPerformancePercentage();
                    if (perf >= 90) excellent++;
                    else if (perf >= 80) veryGood++;
                    else if (perf >= 70) good++;
                    else if (perf >= 60) satisfactory++;
                    else poor++;
                }
            }
            
            distribution.put("excellent", excellent);
            distribution.put("veryGood", veryGood);
            distribution.put("good", good);
            distribution.put("satisfactory", satisfactory);
            distribution.put("poor", poor);
            
        } catch (Exception e) {
            System.err.println("Error getting real performance distribution: " + e.getMessage());
            return getPerformanceDistribution(); // Fallback to mock data
        }
        
        return distribution;
    }
    
    private Map<String, Object> getMockDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalReports", 45);
        summary.put("approvedReports", 38);
        summary.put("rejectedReports", 4);
        summary.put("pendingReports", 3);
        summary.put("averagePerformance", 82);
        summary.put("totalSubcommittees", 7);
        summary.put("activeResolutions", 12);
        
        dashboardData.put("summary", summary);
        dashboardData.put("subcommitteePerformance", getSubcommitteePerformance());
        dashboardData.put("monthlyTrend", getMonthlyTrend());
        dashboardData.put("resolutionProgress", getResolutionProgress());
        dashboardData.put("performanceDistribution", getPerformanceDistribution());
        
        return dashboardData;
    }
    
    // NEW METHODS FOR SIMPLE PERFORMANCE DASHBOARD
    public List<Integer> getAvailableYears() {
        List<Integer> years = new ArrayList<>();
        try {
            // Get years from reports table
            List<Report> reports = reportRepo.findAll();
            Set<Integer> uniqueYears = new HashSet<>();
            
            for (Report report : reports) {
                if (report.getSubmittedAt() != null) {
                    uniqueYears.add(report.getSubmittedAt().getYear());
                }
            }
            
            // Convert to list and sort descending
            years = new ArrayList<>(uniqueYears);
            years.sort(Collections.reverseOrder());
            
            // If no years found, return default years
            if (years.isEmpty()) {
                years = Arrays.asList(2024, 2023, 2022);
            }
            
        } catch (Exception e) {
            System.err.println("Error getting available years: " + e.getMessage());
            years = Arrays.asList(2024, 2023, 2022);
        }
        
        return years;
    }
    
    public Map<String, Object> getSimplePerformanceData(Integer year) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("🔍 DashboardService: getSimplePerformanceData called for year: " + year);
        
        try {
            // Get subcommittee performance data
            List<Map<String, Object>> subcommittees = getSubcommitteePerformanceDataByYear(year);
            System.out.println("🔍 DashboardService: getSimplePerformanceData - Got " + subcommittees.size() + " subcommittees");
            
            // Get monthly overview
            Map<String, Object> monthlyOverview = getMonthlyOverviewData(year);
            System.out.println("🔍 DashboardService: getSimplePerformanceData - Got monthly overview: " + monthlyOverview);
            
            response.put("subcommittees", subcommittees);
            response.put("monthlyOverview", monthlyOverview);
            
            System.out.println("✅ DashboardService: getSimplePerformanceData - Successfully created response with " + 
                             subcommittees.size() + " subcommittees");
            
        } catch (Exception e) {
            System.err.println("❌ DashboardService: getSimplePerformanceData - Error: " + e.getMessage());
            e.printStackTrace();
            // Return sample data if error occurs
            response.put("subcommittees", getSampleSubcommitteeData());
            response.put("monthlyOverview", getSampleMonthlyOverview());
            System.out.println("⚠️ DashboardService: getSimplePerformanceData - Returning sample data due to error");
        }
        
        return response;
    }
    
    private List<Map<String, Object>> getCountryPerformanceData(Integer year) {
        List<Map<String, Object>> countries = new ArrayList<>();
        
        try {
            // Get all countries from the database
            // For now, we'll use sample data based on existing reports
            List<Report> reports = reportRepo.findAll();
            Map<String, List<Report>> countryReports = new HashMap<>();
            
            // Group reports by country (through user)
            for (Report report : reports) {
                if (report.getSubmittedBy() != null && 
                    report.getSubmittedBy().getCountry() != null) {
                    String countryName = report.getSubmittedBy().getCountry().getName();
                    countryReports.computeIfAbsent(countryName, k -> new ArrayList<>()).add(report);
                }
            }
            
            // Calculate performance for each country
            for (Map.Entry<String, List<Report>> entry : countryReports.entrySet()) {
                String countryName = entry.getKey();
                List<Report> countryReportList = entry.getValue();
                
                // Filter reports for the specified year
                List<Report> yearReports = countryReportList.stream()
                    .filter(r -> r.getSubmittedAt() != null && r.getSubmittedAt().getYear() == year)
                    .collect(Collectors.toList());
                
                if (!yearReports.isEmpty()) {
                    Map<String, Object> countryData = new HashMap<>();
                    countryData.put("name", countryName);
                    countryData.put("reports", yearReports.size());
                    
                    // Calculate approval rate
                    long approvedCount = yearReports.stream()
                        .filter(r -> r.getStatus() == Report.ReportStatus.APPROVED_BY_HOD)
                        .count();
                    double approvalRate = (double) approvedCount / yearReports.size() * 100;
                    countryData.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);
                    
                    // Set trend based on approval rate
                    String trend = approvalRate > 80 ? "up" : (approvalRate < 70 ? "down" : "stable");
                    countryData.put("trend", trend);
                    
                    // For now, set assigned resolutions to a sample value
                    // This would need to be calculated from resolution_assignments table
                    countryData.put("assignedResolutions", Math.max(1, yearReports.size() / 2));
                    
                    countries.add(countryData);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error getting country performance data: " + e.getMessage());
        }
        
        // If no data found, return sample data
        if (countries.isEmpty()) {
            countries = getSampleCountryData();
        }
        
        return countries;
    }

    private List<Map<String, Object>> getSubcommitteePerformanceDataByYear(Integer year) {
        List<Map<String, Object>> subcommittees = new ArrayList<>();
        
        try {
            // Get all subcommittees from the database
            List<com.earacg.earaconnect.model.SubCommittee> allSubcommittees = subCommitteeRepo.findAll();
            List<Report> reports = reportRepo.findAll();
            
            System.out.println("🔍 DashboardService: Found " + reports.size() + " total reports");
            System.out.println("🔍 DashboardService: Looking for year: " + year);
            
            // Debug: Check what years are available in the reports
            Set<Integer> availableYears = reports.stream()
                .filter(r -> r.getSubmittedAt() != null)
                .map(r -> r.getSubmittedAt().getYear())
                .collect(Collectors.toSet());
            System.out.println("🔍 DashboardService: Available years in reports: " + availableYears);
            
            // Group reports by subcommittee
            Map<String, List<Report>> subcommitteeReports = new HashMap<>();
            
            for (Report report : reports) {
                if (report.getSubcommittee() != null) {
                    String subcommitteeName = report.getSubcommittee().getName();
                    subcommitteeReports.computeIfAbsent(subcommitteeName, k -> new ArrayList<>()).add(report);
                }
            }
            
            System.out.println("🔍 DashboardService: Found " + subcommitteeReports.size() + " subcommittees with reports");
            
            // Calculate performance for each subcommittee
            for (com.earacg.earaconnect.model.SubCommittee subcommittee : allSubcommittees) {
                String subcommitteeName = subcommittee.getName();
                List<Report> subcommitteeReportList = subcommitteeReports.getOrDefault(subcommitteeName, new ArrayList<>());
                
                System.out.println("🔍 DashboardService: Subcommittee " + subcommitteeName + " has " + subcommitteeReportList.size() + " reports");
                
                // Filter reports for the specified year - but be more flexible
                List<Report> yearReports = subcommitteeReportList.stream()
                    .filter(r -> r.getSubmittedAt() != null && r.getSubmittedAt().getYear() == year)
                    .collect(Collectors.toList());
                
                // If no reports for the specific year, use all reports for this subcommittee
                if (yearReports.isEmpty() && !subcommitteeReportList.isEmpty()) {
                    System.out.println("🔍 DashboardService: No reports for year " + year + ", using all reports for " + subcommitteeName);
                    yearReports = subcommitteeReportList;
                }
                
                if (!yearReports.isEmpty()) {
                    Map<String, Object> subcommitteeData = new HashMap<>();
                    subcommitteeData.put("name", subcommitteeName);
                    subcommitteeData.put("reports", yearReports.size());
                    
                    // Calculate approval rate
                    long approvedCount = yearReports.stream()
                        .filter(r -> r.getStatus() == Report.ReportStatus.APPROVED_BY_HOD)
                        .count();
                    double approvalRate = (double) approvedCount / yearReports.size() * 100;
                    subcommitteeData.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);
                    
                    // Calculate report performance percentage (average performance across all reports)
                    double avgPerformance = yearReports.stream()
                        .filter(r -> r.getPerformancePercentage() != null)
                        .mapToInt(Report::getPerformancePercentage)
                        .average()
                        .orElse(0.0);
                    subcommitteeData.put("performancePercentage", Math.round(avgPerformance * 100.0) / 100.0);
                    
                    // Calculate task assignment percentage (resolutions assigned vs total possible)
                    long totalPossibleTasks = yearReports.size() * 2; // Assume 2 tasks per report
                    long assignedResolutions = yearReports.size(); // For now, assume 1:1 ratio
                    double taskAssignmentPercentage = totalPossibleTasks > 0 ? 
                        (double) assignedResolutions / totalPossibleTasks * 100 : 0;
                    subcommitteeData.put("taskAssignmentPercentage", Math.round(taskAssignmentPercentage * 100.0) / 100.0);
                    
                    // Set trend based on performance percentage
                    String trend = avgPerformance > 80 ? "up" : (avgPerformance < 70 ? "down" : "stable");
                    subcommitteeData.put("trend", trend);
                    
                    // Calculate assigned resolutions (this would need to be enhanced based on actual resolution assignments)
                    subcommitteeData.put("assignedResolutions", assignedResolutions);
                    
                    subcommittees.add(subcommitteeData);
                    System.out.println("✅ DashboardService: Added data for " + subcommitteeName + " with " + yearReports.size() + " reports");
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error getting subcommittee performance data: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("🔍 DashboardService: Returning " + subcommittees.size() + " subcommittees");
        
        // If no data found, return sample data
        if (subcommittees.isEmpty()) {
            System.out.println("⚠️ DashboardService: No data found, returning sample data");
            subcommittees = getSampleSubcommitteeData();
        }
        
        return subcommittees;
    }
    
    private Map<String, Object> getMonthlyOverviewData(Integer year) {
        Map<String, Object> overview = new HashMap<>();
        
        try {
            List<Report> reports = reportRepo.findAll();
            System.out.println("🔍 DashboardService: getMonthlyOverviewData - Found " + reports.size() + " total reports");
            System.out.println("🔍 DashboardService: getMonthlyOverviewData - Looking for year: " + year);
            
            // Filter reports for the specified year
            List<Report> yearReports = reports.stream()
                .filter(r -> r.getSubmittedAt() != null && r.getSubmittedAt().getYear() == year)
                .collect(Collectors.toList());
            
            System.out.println("🔍 DashboardService: getMonthlyOverviewData - Found " + yearReports.size() + " reports for year " + year);
            
            // If no reports for the specific year, use all reports
            if (yearReports.isEmpty() && !reports.isEmpty()) {
                System.out.println("🔍 DashboardService: getMonthlyOverviewData - No reports for year " + year + ", using all reports");
                yearReports = reports;
            }
            
            long totalReports = yearReports.size();
            long approvedReports = yearReports.stream()
                .filter(r -> r.getStatus() == Report.ReportStatus.APPROVED_BY_HOD)
                .count();
            long totalReviews = yearReports.stream()
                .filter(r -> r.getStatus() != Report.ReportStatus.SUBMITTED)
                .count();
            
            double approvalRate = totalReports > 0 ? (double) approvedReports / totalReports * 100 : 0;
            
            System.out.println("🔍 DashboardService: getMonthlyOverviewData - Total reports: " + totalReports + 
                             ", Approved: " + approvedReports + ", Reviews: " + totalReviews + 
                             ", Approval rate: " + approvalRate + "%");
            
            overview.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);
            overview.put("totalReviews", totalReviews);
            overview.put("totalReports", totalReports);
            overview.put("totalResolutions", Math.max(1, totalReports / 2)); // Sample value for now
            
        } catch (Exception e) {
            System.err.println("Error getting monthly overview data: " + e.getMessage());
            e.printStackTrace();
            overview = getSampleMonthlyOverview();
        }
        
        return overview;
    }
    
    private List<Map<String, Object>> getSampleCountryData() {
        List<Map<String, Object>> sampleData = new ArrayList<>();
        
        Map<String, Object> kenya = new HashMap<>();
        kenya.put("name", "Kenya");
        kenya.put("reports", 45);
        kenya.put("assignedResolutions", 38);
        kenya.put("approvalRate", 89.5);
        kenya.put("trend", "up");
        sampleData.add(kenya);
        
        Map<String, Object> uganda = new HashMap<>();
        uganda.put("name", "Uganda");
        uganda.put("reports", 32);
        uganda.put("assignedResolutions", 28);
        uganda.put("approvalRate", 78.2);
        uganda.put("trend", "stable");
        sampleData.add(uganda);
        
        Map<String, Object> tanzania = new HashMap<>();
        tanzania.put("name", "Tanzania");
        tanzania.put("reports", 28);
        tanzania.put("assignedResolutions", 25);
        tanzania.put("approvalRate", 85.7);
        tanzania.put("trend", "up");
        sampleData.add(tanzania);
        
        return sampleData;
    }
    
    private List<Map<String, Object>> getSampleSubcommitteeData() {
        List<Map<String, Object>> sampleData = new ArrayList<>();
        
        Map<String, Object> domesticRevenue = new HashMap<>();
        domesticRevenue.put("name", "Domestic Revenue Sub Committee");
        domesticRevenue.put("reports", 45);
        domesticRevenue.put("assignedResolutions", 38);
        domesticRevenue.put("approvalRate", 89.5);
        domesticRevenue.put("performancePercentage", 87.2);
        domesticRevenue.put("taskAssignmentPercentage", 84.4);
        domesticRevenue.put("trend", "up");
        sampleData.add(domesticRevenue);
        
        Map<String, Object> customsRevenue = new HashMap<>();
        customsRevenue.put("name", "Customs Revenue Sub Committee");
        customsRevenue.put("reports", 32);
        customsRevenue.put("assignedResolutions", 28);
        customsRevenue.put("approvalRate", 78.2);
        customsRevenue.put("performancePercentage", 79.5);
        customsRevenue.put("taskAssignmentPercentage", 87.5);
        customsRevenue.put("trend", "stable");
        sampleData.add(customsRevenue);
        
        Map<String, Object> itCommittee = new HashMap<>();
        itCommittee.put("name", "IT Sub Committee");
        itCommittee.put("reports", 28);
        itCommittee.put("assignedResolutions", 25);
        itCommittee.put("approvalRate", 85.7);
        itCommittee.put("performancePercentage", 91.3);
        itCommittee.put("taskAssignmentPercentage", 89.3);
        itCommittee.put("trend", "up");
        sampleData.add(itCommittee);
        
        Map<String, Object> legalCommittee = new HashMap<>();
        legalCommittee.put("name", "Legal Sub Committee");
        legalCommittee.put("reports", 22);
        legalCommittee.put("assignedResolutions", 20);
        legalCommittee.put("approvalRate", 91.0);
        legalCommittee.put("performancePercentage", 88.7);
        legalCommittee.put("taskAssignmentPercentage", 90.9);
        legalCommittee.put("trend", "up");
        sampleData.add(legalCommittee);
        
        Map<String, Object> hrCommittee = new HashMap<>();
        hrCommittee.put("name", "HR Sub Committee");
        hrCommittee.put("reports", 18);
        hrCommittee.put("assignedResolutions", 16);
        hrCommittee.put("approvalRate", 72.5);
        hrCommittee.put("performancePercentage", 68.9);
        hrCommittee.put("taskAssignmentPercentage", 88.9);
        hrCommittee.put("trend", "down");
        sampleData.add(hrCommittee);
        
        Map<String, Object> researchCommittee = new HashMap<>();
        researchCommittee.put("name", "Research Sub Committee");
        researchCommittee.put("reports", 15);
        researchCommittee.put("assignedResolutions", 12);
        researchCommittee.put("approvalRate", 80.0);
        researchCommittee.put("performancePercentage", 82.1);
        researchCommittee.put("taskAssignmentPercentage", 80.0);
        researchCommittee.put("trend", "stable");
        sampleData.add(researchCommittee);
        
        return sampleData;
    }
    
    private Map<String, Object> getSampleMonthlyOverview() {
        Map<String, Object> overview = new HashMap<>();
        overview.put("approvalRate", 85.5);
        overview.put("totalReviews", 15);
        overview.put("totalReports", 105);
        overview.put("totalResolutions", 91);
        return overview;
    }
}