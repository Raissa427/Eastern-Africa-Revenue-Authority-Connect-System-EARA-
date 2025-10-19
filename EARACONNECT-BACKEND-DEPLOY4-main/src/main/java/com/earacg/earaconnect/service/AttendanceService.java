package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.Attendance;
import com.earacg.earaconnect.repository.AttendanceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepo attendanceRepo;

    public List<Attendance> getAllAttendance() {
        return attendanceRepo.findAll();
    }

    public Optional<Attendance> getAttendanceById(Long id) {
        return attendanceRepo.findById(id);
    }

    public List<Attendance> getAttendanceByMeeting(Long meetingId) {
        return attendanceRepo.findByMeetingId(meetingId);
    }

    public List<Attendance> getAttendanceByUser(Long userId) {
        return attendanceRepo.findByUserId(userId);
    }

    public List<Attendance> getAttendanceByStatus(Attendance.AttendanceStatus status) {
        return attendanceRepo.findByStatus(status);
    }

    public Attendance createAttendance(Attendance attendance) {
        if (attendance.getMeeting() == null || attendance.getUser() == null) {
            return null;
        }
        
        attendance.setRecordedAt(LocalDateTime.now());
        
        return attendanceRepo.save(attendance);
    }

    public Attendance updateAttendance(Long id, Attendance attendanceDetails) {
        Optional<Attendance> attendanceOpt = attendanceRepo.findById(id);
        if (attendanceOpt.isPresent()) {
            Attendance attendance = attendanceOpt.get();
            
            if (attendanceDetails.getStatus() != null) {
                attendance.setStatus(attendanceDetails.getStatus());
            }
            
            if (attendanceDetails.getNotes() != null) {
                attendance.setNotes(attendanceDetails.getNotes());
            }
            
            if (attendanceDetails.getRecordedBy() != null) {
                attendance.setRecordedBy(attendanceDetails.getRecordedBy());
            }
            
            return attendanceRepo.save(attendance);
        }
        return null;
    }

    public boolean deleteAttendance(Long id) {
        if (attendanceRepo.existsById(id)) {
            attendanceRepo.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Attendance> createBulkAttendance(List<Attendance> attendanceRecords) {
        for (Attendance record : attendanceRecords) {
            if (record.getRecordedAt() == null) {
                record.setRecordedAt(LocalDateTime.now());
            }
        }
        return attendanceRepo.saveAll(attendanceRecords);
    }
}
