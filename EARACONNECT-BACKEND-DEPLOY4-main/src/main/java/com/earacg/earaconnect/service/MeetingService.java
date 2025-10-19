package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.*;
import com.earacg.earaconnect.repository.*;
import com.earacg.earaconnect.controller.MeetingController.AttendanceRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Set;

@Service
public class MeetingService {

    @Autowired
    private AttendanceRepo attendanceRepo;

    @Autowired
    private MeetingInvitationRepo meetingInvitationRepo;
        
    @Autowired
    private MeetingRepo meetingRepo;
    
    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private ResolutionRepo resolutionRepo;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private SecretaryValidationService secretaryValidationService;
    
    // Basic CRUD Operations
    public List<Meeting> getAllMeetings() {
        return meetingRepo.findAll();
    }
    
    public Optional<Meeting> getMeetingById(Long id) {
        return meetingRepo.findById(id);
    }
    
    public List<Meeting> getMeetingsByCreator(Long createdById) {
        return meetingRepo.findByCreatedById(createdById);
    }
    
    public List<Meeting> getMeetingsByCountry(Long countryId) {
        return meetingRepo.findByHostingCountryId(countryId);
    }
    
    public List<Meeting> getMeetingsByType(Meeting.MeetingType meetingType) {
        return meetingRepo.findByMeetingType(meetingType);
    }
    
    public Meeting createMeeting(Meeting meeting, MultipartFile invitationPdf) {
        // Validate secretary location if creator is a secretary
        if (meeting.getCreatedBy() != null && 
            secretaryValidationService.isSecretary(meeting.getCreatedBy())) {
            
            boolean locationValid = secretaryValidationService.validateSecretaryLocation(
                meeting.getCreatedBy(), meeting);
            
            if (!locationValid) {
                String message = secretaryValidationService.getLocationValidationMessage(
                    meeting.getCreatedBy(), meeting);
                throw new IllegalArgumentException("Location validation failed: " + message);
            }
        }
        
        // Handle PDF upload if provided
        if (invitationPdf != null && !invitationPdf.isEmpty()) {
            try {
                // Generate unique filename
                String fileName = "invitation_" + System.currentTimeMillis() + "_" + invitationPdf.getOriginalFilename();
                // Store file path (you might want to implement actual file storage)
                meeting.setInvitationPdf(fileName);
            } catch (Exception e) {
                throw new RuntimeException("Failed to process invitation PDF", e);
            }
        }
        
        Meeting savedMeeting = meetingRepo.save(meeting);
        
        // Send invitations to relevant users based on meeting type
        sendMeetingInvitations(savedMeeting);
        
        return savedMeeting;
    }

    public Meeting uploadInvitationPdf(Long meetingId, MultipartFile invitationPdf) {
        Optional<Meeting> meetingOpt = meetingRepo.findById(meetingId);
        if (meetingOpt.isPresent()) {
            Meeting meeting = meetingOpt.get();
            
            try {
                // Generate unique filename
                String fileName = "invitation_" + System.currentTimeMillis() + "_" + invitationPdf.getOriginalFilename();
                // Store file path (you might want to implement actual file storage)
                meeting.setInvitationPdf(fileName);
                return meetingRepo.save(meeting);
            } catch (Exception e) {
                throw new RuntimeException("Failed to process invitation PDF", e);
            }
        }
        return null;
    }
    
    public Meeting updateMeeting(Long id, Meeting meetingDetails) {
        Optional<Meeting> meetingOpt = meetingRepo.findById(id);
        if (meetingOpt.isPresent()) {
            Meeting meeting = meetingOpt.get();
            meeting.setTitle(meetingDetails.getTitle());
            meeting.setDescription(meetingDetails.getDescription());
            meeting.setAgenda(meetingDetails.getAgenda());
            meeting.setMeetingDate(meetingDetails.getMeetingDate());
            meeting.setLocation(meetingDetails.getLocation());
            meeting.setMeetingType(meetingDetails.getMeetingType());
            meeting.setStatus(meetingDetails.getStatus());
            meeting.setMinutes(meetingDetails.getMinutes());
            return meetingRepo.save(meeting);
        }
        return null;
    }
    
    public boolean deleteMeeting(Long id) {
        if (meetingRepo.existsById(id)) {
            meetingRepo.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Secretary validation
    public boolean validateSecretaryLocation(Long meetingId, Long secretaryId) {
        Optional<Meeting> meetingOpt = meetingRepo.findById(meetingId);
        Optional<User> secretaryOpt = userRepo.findById(secretaryId);
        
        if (meetingOpt.isPresent() && secretaryOpt.isPresent()) {
            Meeting meeting = meetingOpt.get();
            User secretary = secretaryOpt.get();
            
            // Ensure secretary can only manage meetings in their country
            if (secretary.getCountry() != null && meeting.getHostingCountry() != null) {
                return meeting.getHostingCountry().getId().equals(secretary.getCountry().getId());
            }
        }
        return false;
    }
    
    // Invitation Management
    
    /**
     * Send automatic invitations based on meeting type (used during meeting creation)
     */
    private void sendMeetingInvitations(Meeting meeting) {
        List<User> usersToInvite = getUsersForMeetingType(meeting.getMeetingType(), meeting.getHostingCountry().getId());
        
        for (User user : usersToInvite) {
            createAndSendInvitation(meeting, user);
        }
    }
    
    /**
     * Send invitations to specific users for a meeting (secretary-initiated)
     */
    public void sendInvitationsToUsers(Long meetingId, List<Long> userIds) {
        Meeting meeting = meetingRepo.findById(meetingId)
            .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
        System.out.println("📧 Starting to send invitations for meeting: " + meeting.getTitle());
        System.out.println("👥 Number of users to invite: " + userIds.size());
        
        int successCount = 0;
        int errorCount = 0;
        
        for (Long userId : userIds) {
            try {
                User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
                
                // Check if invitation already exists
                Optional<MeetingInvitation> existingInvitation = meetingInvitationRepo
                    .findByMeetingIdAndUserId(meetingId, userId);
                
                if (existingInvitation.isEmpty()) {
                    createAndSendInvitation(meeting, user);
                    successCount++;
                    System.out.println("✅ Invitation created and sent for user: " + user.getName() + " (" + user.getEmail() + ")");
                } else {
                    System.out.println("⚠️ Invitation already exists for user: " + user.getName() + " (" + user.getEmail() + ")");
                    successCount++; // Count as success since invitation exists
                }
            } catch (Exception e) {
                errorCount++;
                System.err.println("❌ Failed to process invitation for user ID " + userId + ": " + e.getMessage());
            }
        }
        
        System.out.println("📊 Invitation summary - Success: " + successCount + ", Errors: " + errorCount);
    }
    
    /**
     * Helper method to create and send invitation
     */
    private void createAndSendInvitation(Meeting meeting, User user) {
        // Create new invitation
        MeetingInvitation invitation = new MeetingInvitation();
        invitation.setMeeting(meeting);
        invitation.setUser(user);
        invitation.setStatus(MeetingInvitation.InvitationStatus.PENDING);
        invitation.setSentAt(LocalDateTime.now());
        
        // Save invitation
        meetingInvitationRepo.save(invitation);
        
        // Send email invitation with error handling
        try {
            System.out.println("📧 Attempting to send email invitation to: " + user.getEmail());
            emailService.sendMeetingInvitation(
                user.getEmail(),
                user.getName(),
                meeting.getTitle(),
                meeting.getMeetingDate().toString(),
                meeting.getLocation()
            );
            System.out.println("✅ Email invitation sent successfully to: " + user.getEmail());
        } catch (Exception emailError) {
            System.err.println("❌ Failed to send email invitation to " + user.getEmail() + ": " + emailError.getMessage());
            // Don't throw the exception - continue with the invitation process
            // The invitation is still created in the database
        }
        
        // Create in-system notification
        try {
            notificationService.createNotification(
                user.getId(),
                "Meeting Invitation",
                "You have been invited to attend: " + meeting.getTitle(),
                Notification.NotificationType.MEETING_INVITATION,
                "Meeting",
                meeting.getId()
            );
        } catch (Exception notificationError) {
            System.err.println("❌ Failed to create notification for user " + user.getId() + ": " + notificationError.getMessage());
            // Don't throw the exception - continue with the invitation process
        }
    }
    
    /**
     * Get users to invite based on meeting type and country (REMOVED BOARD_MEMBER)
     */
    private List<User> getUsersForMeetingType(Meeting.MeetingType meetingType, Long countryId) {
        switch (meetingType) {
            case COMMISSIONER_GENERAL_MEETING:
                return userRepo.findByRole(User.UserRole.COMMISSIONER_GENERAL);
            case TECHNICAL_MEETING:
                // Only secretaries from the same country
                return userRepo.findByRoleAndCountryId(User.UserRole.SECRETARY, countryId);
            case SUBCOMMITTEE_MEETING:
                // Only chairs from the same country
                return userRepo.findByRoleAndCountryId(User.UserRole.CHAIR, countryId);
            default:
                // For other meeting types, invite all users from the same country
                return userRepo.findByCountryId(countryId);
        }
    }
    
    // Attendance Management
    
    /**
     * Record attendance for a meeting
     */
    public void recordAttendance(Long meetingId, List<AttendanceRecord> attendanceRecords) {
        Meeting meeting = meetingRepo.findById(meetingId)
            .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
        for (AttendanceRecord record : attendanceRecords) {
            User user = userRepo.findById(record.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + record.getUserId()));
            
            // Check if attendance record already exists
            Optional<Attendance> existingAttendance = attendanceRepo
                .findByMeetingIdAndUserId(meetingId, record.getUserId());
            
            if (existingAttendance.isPresent()) {
                // Update existing attendance
                Attendance attendance = existingAttendance.get();
                attendance.setStatus(Attendance.AttendanceStatus.valueOf(record.getStatus().toUpperCase()));
                attendance.setNotes(record.getNotes());
                attendance.setRecordedAt(LocalDateTime.now());
                attendanceRepo.save(attendance);
            } else {
                // Create new attendance record
                Attendance attendance = new Attendance();
                attendance.setMeeting(meeting);
                attendance.setUser(user);
                attendance.setStatus(Attendance.AttendanceStatus.valueOf(record.getStatus().toUpperCase()));
                attendance.setNotes(record.getNotes());
                attendance.setRecordedAt(LocalDateTime.now());
                attendanceRepo.save(attendance);
            }
        }
    }
    
    /**
     * Get attendance records for a meeting
     */
    public List<AttendanceRecord> getAttendance(Long meetingId) {
        List<Attendance> attendanceList = attendanceRepo.findByMeetingId(meetingId);
        
        return attendanceList.stream()
            .map(attendance -> new AttendanceRecord(
                attendance.getUser().getId(),
                attendance.getStatus().toString(),
                attendance.getNotes()
            ))
            .collect(Collectors.toList());
    }
    
    // Minutes Management
    public Meeting updateMeetingMinutes(Long id, String minutes) {
        Optional<Meeting> meetingOpt = meetingRepo.findById(id);
        if (meetingOpt.isPresent()) {
            Meeting meeting = meetingOpt.get();
            meeting.setMinutes(minutes);
            meeting.setStatus(Meeting.MeetingStatus.COMPLETED);
            meeting.setUpdatedAt(LocalDateTime.now());
            return meetingRepo.save(meeting);
        }
        return null;
    }
    
    // Resolution Management (Simplified)
    public void createResolutions(Long meetingId, Map<String, Object> request) {
        Optional<Meeting> meetingOpt = meetingRepo.findById(meetingId);
        if (!meetingOpt.isPresent()) {
            throw new RuntimeException("Meeting not found");
        }
        
        Meeting meeting = meetingOpt.get();
        List<Map<String, Object>> resolutionsData = (List<Map<String, Object>>) request.get("resolutions");
        
        if (resolutionsData == null || resolutionsData.isEmpty()) {
            throw new RuntimeException("No resolutions provided");
        }
        
        for (Map<String, Object> resolutionData : resolutionsData) {
            Resolution resolution = new Resolution();
            resolution.setTitle((String) resolutionData.get("title"));
            resolution.setDescription((String) resolutionData.get("description"));
            resolution.setMeeting(meeting);
            resolution.setCreatedBy(meeting.getCreatedBy());
            resolution.setStatus(Resolution.ResolutionStatus.ASSIGNED);
            resolution.setCreatedAt(LocalDateTime.now());
            
            // Save resolution
            resolutionRepo.save(resolution);
        }
        
        // Send notifications about new resolutions
        sendResolutionNotifications(meeting);
    }
    
    /**
     * Send notifications about new resolutions
     */
    private void sendResolutionNotifications(Meeting meeting) {
        // Get relevant users to notify about new resolutions
        List<User> usersToNotify = getUsersForMeetingType(meeting.getMeetingType(), meeting.getHostingCountry().getId());
        
        for (User user : usersToNotify) {
            notificationService.createNotification(
                user.getId(),
                "New Resolutions Available",
                "New resolutions have been created for meeting: " + meeting.getTitle(),
                Notification.NotificationType.TASK_ASSIGNMENT,
                "Resolution",
                meeting.getId()
            );
        }
    }
    
    // Utility Methods
    
    /**
     * Get meeting statistics for dashboard
     */
    public Map<String, Long> getMeetingStatistics(Long countryId) {
        List<Meeting> meetings = getMeetingsByCountry(countryId);
        
        long totalMeetings = meetings.size();
        long completedMeetings = meetings.stream()
            .filter(m -> m.getStatus() == Meeting.MeetingStatus.COMPLETED)
            .count();
        long upcomingMeetings = meetings.stream()
            .filter(m -> m.getStatus() == Meeting.MeetingStatus.SCHEDULED && 
                        m.getMeetingDate().isAfter(LocalDateTime.now()))
            .count();
        
        return Map.of(
            "total", totalMeetings,
            "completed", completedMeetings,
            "upcoming", upcomingMeetings
        );
    }
    
    /**
     * Get meetings for a specific user (where they are invited)
     */
    public List<Meeting> getMeetingsForUser(Long userId) {
        List<MeetingInvitation> invitations = meetingInvitationRepo.findByUserId(userId);
        return invitations.stream()
            .map(MeetingInvitation::getMeeting)
            .collect(Collectors.toList());
    }
    
    /**
     * Get potential invitees for a meeting based on meeting type and location
     */
    public List<Map<String, Object>> getPotentialInvitees(Long meetingId) {
        Meeting meeting = meetingRepo.findById(meetingId)
            .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
        // Get users based on meeting type and hosting country
        List<User> potentialInvitees = getUsersForMeetingType(meeting.getMeetingType(), meeting.getHostingCountry().getId());
        
        // Get existing invitations to exclude already invited users
        List<MeetingInvitation> existingInvitations = meetingInvitationRepo.findByMeetingId(meetingId);
        Set<Long> invitedUserIds = existingInvitations.stream()
            .map(invitation -> invitation.getUser().getId())
            .collect(Collectors.toSet());
        
        // Filter out already invited users and convert to response format
        return potentialInvitees.stream()
            .filter(user -> !invitedUserIds.contains(user.getId()))
            .map(user -> {
                Map<String, Object> invitee = new HashMap<>();
                invitee.put("id", user.getId());
                invitee.put("name", user.getName());
                invitee.put("email", user.getEmail());
                invitee.put("role", user.getRole().toString());
                
                // Add country information if available
                if (user.getCountry() != null) {
                    Map<String, Object> country = new HashMap<>();
                    country.put("id", user.getCountry().getId());
                    country.put("name", user.getCountry().getName());
                    invitee.put("country", country);
                }
                
                // Add subcommittee information if available
                if (user.getSubcommittee() != null) {
                    Map<String, Object> subcommittee = new HashMap<>();
                    subcommittee.put("id", user.getSubcommittee().getId());
                    subcommittee.put("name", user.getSubcommittee().getName());
                    invitee.put("subcommittee", subcommittee);
                }
                
                return invitee;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Update meeting minutes with secretary location validation
     */
    public Meeting updateMeetingMinutesWithValidation(Long meetingId, String minutes, Long secretaryId) {
        Meeting meeting = meetingRepo.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
        // Validate secretary can take minutes for this meeting
        SecretaryValidationService.ValidationResult validation = 
                secretaryValidationService.validateMinuteTaking(secretaryId, meetingId);
        
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Cannot update minutes: " + validation.getMessage());
        }
        
        // Additional location validation if secretary is from different country
        User secretary = userRepo.findById(secretaryId)
                .orElseThrow(() -> new RuntimeException("Secretary not found"));
        
        if (!secretaryValidationService.validateSecretaryLocation(secretary, meeting)) {
            String message = secretaryValidationService.getLocationValidationMessage(secretary, meeting);
            throw new IllegalArgumentException("Location validation failed: " + message);
        }
        
        meeting.setMinutes(minutes);
        meeting.setStatus(Meeting.MeetingStatus.COMPLETED);
        meeting.setUpdatedAt(LocalDateTime.now());
        
        return meetingRepo.save(meeting);
    }
    
    /**
     * Get meetings that a secretary can manage based on location
     */
    public List<Meeting> getMeetingsForSecretary(Long secretaryId) {
        User secretary = userRepo.findById(secretaryId)
                .orElseThrow(() -> new RuntimeException("Secretary not found"));
        
        if (!secretaryValidationService.isSecretary(secretary)) {
            throw new IllegalArgumentException("User is not a secretary");
        }
        
        if (secretary.getCountry() == null) {
            throw new IllegalArgumentException("Secretary must have a country assigned");
        }
        
        // Return meetings from secretary's country
        return getMeetingsByCountry(secretary.getCountry().getId());
    }
    
    /**
     * Validate secretary can perform meeting operations
     */
    public boolean validateSecretaryMeetingAccess(Long secretaryId, Long meetingId) {
        try {
            User secretary = userRepo.findById(secretaryId)
                    .orElseThrow(() -> new RuntimeException("Secretary not found"));
            
            Meeting meeting = meetingRepo.findById(meetingId)
                    .orElseThrow(() -> new RuntimeException("Meeting not found"));
            
            return secretaryValidationService.validateSecretaryLocation(secretary, meeting);
        } catch (Exception e) {
            return false;
        }
    }
}