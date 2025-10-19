package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.model.Attendance;
import com.earacg.earaconnect.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        try {
            List<Attendance> attendance = attendanceService.getAllAttendance();
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            System.err.println("Error in getAllAttendance: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long id) {
        return attendanceService.getAttendanceById(id)
                .map(attendance -> ResponseEntity.ok(attendance))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<Attendance>> getAttendanceByMeeting(@PathVariable Long meetingId) {
        try {
            List<Attendance> attendance = attendanceService.getAttendanceByMeeting(meetingId);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            System.err.println("Error in getAttendanceByMeeting: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Attendance>> getAttendanceByUser(@PathVariable Long userId) {
        try {
            List<Attendance> attendance = attendanceService.getAttendanceByUser(userId);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            System.err.println("Error in getAttendanceByUser: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Attendance>> getAttendanceByStatus(@PathVariable String status) {
        try {
            Attendance.AttendanceStatus attendanceStatus = Attendance.AttendanceStatus.valueOf(status.toUpperCase());
            List<Attendance> attendance = attendanceService.getAttendanceByStatus(attendanceStatus);
            return ResponseEntity.ok(attendance);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error in getAttendanceByStatus: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Attendance> createAttendance(@RequestBody Attendance attendance) {
        Attendance createdAttendance = attendanceService.createAttendance(attendance);
        if (createdAttendance != null) {
            return ResponseEntity.ok(createdAttendance);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id, @RequestBody Attendance attendanceDetails) {
        Attendance updatedAttendance = attendanceService.updateAttendance(id, attendanceDetails);
        if (updatedAttendance != null) {
            return ResponseEntity.ok(updatedAttendance);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAttendance(@PathVariable Long id) {
        boolean deleted = attendanceService.deleteAttendance(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Attendance record deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/bulk")
    public ResponseEntity<List<Attendance>> createBulkAttendance(@RequestBody List<Attendance> attendanceRecords) {
        try {
            List<Attendance> createdRecords = attendanceService.createBulkAttendance(attendanceRecords);
            return ResponseEntity.ok(createdRecords);
        } catch (Exception e) {
            System.err.println("Error in createBulkAttendance: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
