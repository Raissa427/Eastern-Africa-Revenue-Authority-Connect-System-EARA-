package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.model.Meeting;
import com.earacg.earaconnect.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class MeetingController {
    
    @Autowired
    private MeetingService meetingService;
    
    // Basic CRUD Operations
    @GetMapping
    public ResponseEntity<List<Meeting>> getAllMeetings() {
        return ResponseEntity.ok(meetingService.getAllMeetings());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable Long id) {
        return meetingService.getMeetingById(id)
                .map(meeting -> ResponseEntity.ok(meeting))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/creator/{createdById}")
    public ResponseEntity<List<Meeting>> getMeetingsByCreator(@PathVariable Long createdById) {
        return ResponseEntity.ok(meetingService.getMeetingsByCreator(createdById));
    }
    
    @GetMapping("/country/{countryId}")
    public ResponseEntity<List<Meeting>> getMeetingsByCountry(@PathVariable Long countryId) {
        return ResponseEntity.ok(meetingService.getMeetingsByCountry(countryId));
    }
    
    @GetMapping("/secretary/{secretaryId}")
    public ResponseEntity<?> getMeetingsForSecretary(@PathVariable Long secretaryId) {
        try {
            List<Meeting> meetings = meetingService.getMeetingsForSecretary(secretaryId);
            return ResponseEntity.ok(meetings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to retrieve meetings"));
        }
    }
    
    @GetMapping("/type/{meetingType}")
    public ResponseEntity<List<Meeting>> getMeetingsByType(@PathVariable String meetingType) {
        try {
            Meeting.MeetingType type = Meeting.MeetingType.valueOf(meetingType.toUpperCase());
            return ResponseEntity.ok(meetingService.getMeetingsByType(type));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Meeting> createMeeting(@RequestBody Meeting meeting) {
        Meeting createdMeeting = meetingService.createMeeting(meeting, null);
        if (createdMeeting != null) {
            return ResponseEntity.ok(createdMeeting);
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{meetingId}/upload-invitation")
    public ResponseEntity<Meeting> uploadInvitationPdf(
            @PathVariable Long meetingId,
            @RequestParam("invitationPdf") MultipartFile invitationPdf) {
        
        Meeting updatedMeeting = meetingService.uploadInvitationPdf(meetingId, invitationPdf);
        if (updatedMeeting != null) {
            return ResponseEntity.ok(updatedMeeting);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Meeting> updateMeeting(@PathVariable Long id, @RequestBody Meeting meetingDetails) {
        Meeting updatedMeeting = meetingService.updateMeeting(id, meetingDetails);
        if (updatedMeeting != null) {
            return ResponseEntity.ok(updatedMeeting);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMeeting(@PathVariable Long id) {
        boolean deleted = meetingService.deleteMeeting(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Meeting deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
    
    // Secretary validation
    @PostMapping("/{meetingId}/validate-secretary")
    public ResponseEntity<Map<String, Boolean>> validateSecretaryLocation(
            @PathVariable Long meetingId, 
            @RequestParam Long secretaryId) {
        boolean isValid = meetingService.validateSecretaryLocation(meetingId, secretaryId);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }
    
    // Meeting invitations management
    @PostMapping("/{meetingId}/invitations/send")
    public ResponseEntity<?> sendMeetingInvitations(
            @PathVariable Long meetingId,
            @RequestParam Long secretaryId,
            @RequestBody List<Long> inviteeIds) {
        try {
            System.out.println("📧 Received invitation request:");
            System.out.println("   Meeting ID: " + meetingId);
            System.out.println("   Secretary ID: " + secretaryId);
            System.out.println("   Number of invitees: " + inviteeIds.size());
            
            // Validate secretary has permission for this meeting
            if (!meetingService.validateSecretaryLocation(meetingId, secretaryId)) {
                System.err.println("❌ Secretary validation failed for meeting " + meetingId + " and secretary " + secretaryId);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Secretary can only manage meetings in their country"));
            }
            
            System.out.println("✅ Secretary validation passed");
            
            meetingService.sendInvitationsToUsers(meetingId, inviteeIds);
            
            System.out.println("✅ Invitations processed successfully");
            return ResponseEntity.ok(Map.of(
                "message", "Invitations sent successfully",
                "meetingId", meetingId,
                "inviteeCount", inviteeIds.size(),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            System.err.println("❌ Error in sendMeetingInvitations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to send invitations: " + e.getMessage()));
        }
    }
    
    // Attendance management
    @PostMapping("/{meetingId}/attendance")
    public ResponseEntity<?> recordAttendance(
            @PathVariable Long meetingId,
            @RequestParam Long secretaryId,
            @RequestBody List<AttendanceRecord> attendanceRecords) {
        try {
            if (!meetingService.validateSecretaryLocation(meetingId, secretaryId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unauthorized to record attendance for this meeting"));
            }
            
            meetingService.recordAttendance(meetingId, attendanceRecords);
            return ResponseEntity.ok(Map.of("message", "Attendance recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to record attendance: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{meetingId}/attendance")
    public ResponseEntity<?> getAttendance(
            @PathVariable Long meetingId,
            @RequestParam Long secretaryId) {
        try {
            if (!meetingService.validateSecretaryLocation(meetingId, secretaryId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Unauthorized to view attendance for this meeting"));
            }
            
            List<AttendanceRecord> attendance = meetingService.getAttendance(meetingId);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to retrieve attendance: " + e.getMessage()));
        }
    }
    
    // Meeting minutes management
    @PutMapping("/{meetingId}/minutes")
    public ResponseEntity<?> updateMeetingMinutes(
            @PathVariable Long meetingId,
            @RequestParam(required = false) Long secretaryId,
            @RequestBody Map<String, String> request) {
        try {
            // If secretaryId is provided, validate permissions
            if (secretaryId != null && !meetingService.validateSecretaryLocation(meetingId, secretaryId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unauthorized to update minutes for this meeting"));
            }
            
            String minutes = request.get("minutes");
            Meeting updatedMeeting = meetingService.updateMeetingMinutes(meetingId, minutes);
            
            if (updatedMeeting != null) {
                return ResponseEntity.ok(updatedMeeting);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update minutes: " + e.getMessage()));
        }
    }
    
    // Resolutions management
    @PostMapping("/{id}/resolutions")
    public ResponseEntity<Map<String, String>> createResolutions(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> request) {
        try {
            meetingService.createResolutions(id, request);
            return ResponseEntity.ok(Map.of("message", "Resolutions created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get potential invitees for a meeting
    @GetMapping("/{meetingId}/potential-invitees")
    public ResponseEntity<?> getPotentialInvitees(@PathVariable Long meetingId) {
        try {
            List<Map<String, Object>> potentialInvitees = meetingService.getPotentialInvitees(meetingId);
            return ResponseEntity.ok(potentialInvitees);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to fetch potential invitees: " + e.getMessage()));
        }
    }
    
    // Static inner class for attendance records
    public static class AttendanceRecord {
        private Long userId;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String notes;
        
        // Constructors
        public AttendanceRecord() {}
        
        public AttendanceRecord(Long userId, String status, String notes) {
            this.userId = userId;
            this.status = status;
            this.notes = notes;
        }
        
        // Getters and setters
        public Long getUserId() { 
            return userId; 
        }
        
        public void setUserId(Long userId) { 
            this.userId = userId; 
        }
        
        public String getStatus() { 
            return status; 
        }
        
        public void setStatus(String status) { 
            this.status = status; 
        }
        
        public String getNotes() { 
            return notes; 
        }
        
        public void setNotes(String notes) { 
            this.notes = notes; 
        }
        
        @Override
        public String toString() {
            return "AttendanceRecord{" +
                    "userId=" + userId +
                    ", status='" + status + '\'' +
                    ", notes='" + notes + '\'' +
                    '}';
        }
    }
}