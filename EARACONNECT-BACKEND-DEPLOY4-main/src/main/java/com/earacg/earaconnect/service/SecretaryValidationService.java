package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.Meeting;
import com.earacg.earaconnect.model.User;
import com.earacg.earaconnect.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecretaryValidationService {

    private final UserRepo userRepo;

    /**
     * Validate if a secretary can perform meeting-related tasks based on location restrictions
     */
    public boolean validateSecretaryLocation(Long secretaryId, Meeting meeting) {
        try {
            User secretary = userRepo.findById(secretaryId)
                    .orElseThrow(() -> new IllegalArgumentException("Secretary not found with ID: " + secretaryId));
            
            return validateSecretaryLocation(secretary, meeting);
        } catch (Exception e) {
            log.error("Error validating secretary location: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate if a secretary can perform meeting-related tasks based on location restrictions
     */
    public boolean validateSecretaryLocation(User secretary, Meeting meeting) {
        // Check if user is a secretary
        if (!isSecretary(secretary)) {
            log.warn("User {} is not a secretary, cannot perform secretary tasks", secretary.getEmail());
            return false;
        }

        // Check if secretary has a country assigned
        if (secretary.getCountry() == null) {
            log.warn("Secretary {} has no country assigned", secretary.getEmail());
            return false;
        }

        // Check if meeting has a hosting country
        if (meeting.getHostingCountry() == null) {
            log.warn("Meeting {} has no hosting country assigned", meeting.getTitle());
            return false;
        }

        // Validate location match
        boolean locationMatch = secretary.getCountry().getId().equals(meeting.getHostingCountry().getId());
        
        if (!locationMatch) {
            log.info("Secretary {} from country {} cannot manage meeting in country {}", 
                     secretary.getEmail(), 
                     secretary.getCountry().getName(),
                     meeting.getHostingCountry().getName());
        }

        return locationMatch;
    }

    /**
     * Check if user has secretary role
     */
    public boolean isSecretary(User user) {
        return user.getRole() == User.UserRole.SECRETARY || 
               user.getRole() == User.UserRole.COMMITTEE_SECRETARY ||
               user.getRole() == User.UserRole.DELEGATION_SECRETARY;
    }

    /**
     * Validate secretary can create meeting in specific country
     */
    public boolean validateSecretaryCanCreateMeeting(Long secretaryId, Long hostingCountryId) {
        try {
            User secretary = userRepo.findById(secretaryId)
                    .orElseThrow(() -> new IllegalArgumentException("Secretary not found with ID: " + secretaryId));
            
            if (!isSecretary(secretary)) {
                return false;
            }

            if (secretary.getCountry() == null) {
                log.warn("Secretary {} has no country assigned", secretary.getEmail());
                return false;
            }

            return secretary.getCountry().getId().equals(hostingCountryId);
        } catch (Exception e) {
            log.error("Error validating secretary meeting creation: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get validation message for location restrictions
     */
    public String getLocationValidationMessage(User secretary, Meeting meeting) {
        if (!isSecretary(secretary)) {
            return "Only secretaries can perform meeting management tasks";
        }

        if (secretary.getCountry() == null) {
            return "Secretary must have a country assigned to manage meetings";
        }

        if (meeting.getHostingCountry() == null) {
            return "Meeting must have a hosting country assigned";
        }

        if (!secretary.getCountry().getId().equals(meeting.getHostingCountry().getId())) {
            return String.format("Secretary from %s cannot manage meetings hosted in %s", 
                                secretary.getCountry().getName(), 
                                meeting.getHostingCountry().getName());
        }

        return "Location validation passed";
    }

    /**
     * Validate secretary can take minutes for a meeting
     */
    public ValidationResult validateMinuteTaking(Long secretaryId, Long meetingId) {
        try {
            User secretary = userRepo.findById(secretaryId)
                    .orElseThrow(() -> new IllegalArgumentException("Secretary not found"));
            
            // For now, we'll just validate the secretary role and location
            // In a real system, you might also check if the meeting is in progress
            if (!isSecretary(secretary)) {
                return new ValidationResult(false, "Only secretaries can take meeting minutes");
            }

            if (secretary.getCountry() == null) {
                return new ValidationResult(false, "Secretary must have a country assigned");
            }

            return new ValidationResult(true, "Secretary authorized to take minutes");
        } catch (Exception e) {
            log.error("Error validating minute taking: {}", e.getMessage());
            return new ValidationResult(false, "Validation error: " + e.getMessage());
        }
    }

    /**
     * Validate secretary can assign resolutions
     */
    public ValidationResult validateResolutionAssignment(Long secretaryId) {
        try {
            User secretary = userRepo.findById(secretaryId)
                    .orElseThrow(() -> new IllegalArgumentException("Secretary not found"));
            
            if (!isSecretary(secretary)) {
                return new ValidationResult(false, "Only secretaries can assign resolutions");
            }

            return new ValidationResult(true, "Secretary authorized to assign resolutions");
        } catch (Exception e) {
            log.error("Error validating resolution assignment: {}", e.getMessage());
            return new ValidationResult(false, "Validation error: " + e.getMessage());
        }
    }

    /**
     * Result class for validation operations
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String message;

        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }
        
        public boolean getValid() {
            return valid;
        }
    }
}
