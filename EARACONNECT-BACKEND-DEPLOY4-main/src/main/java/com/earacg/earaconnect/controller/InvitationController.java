package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invitations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class InvitationController {
    
    @Autowired
    private InvitationService invitationService;
    
    /**
     * Send invitations to multiple users for a meeting
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendInvitations(@RequestBody Map<String, Object> request) {
        try {
            Long meetingId = Long.valueOf(request.get("meetingId").toString());
            Long senderId = Long.valueOf(request.get("senderId").toString());
            List<Integer> recipientIdsInt = (List<Integer>) request.get("recipientIds");
            List<Long> recipientIds = recipientIdsInt.stream()
                    .map(Integer::longValue)
                    .toList();
            String message = (String) request.get("message");
            Boolean sendEmail = (Boolean) request.get("sendEmail");
            
            Map<String, Object> result = invitationService.sendInvitations(
                meetingId, senderId, recipientIds, message, sendEmail);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to send invitations: " + e.getMessage()));
        }
    }
    
    /**
     * Get all invitations for a meeting
     */
    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<?> getMeetingInvitations(@PathVariable Long meetingId) {
        try {
            List<Map<String, Object>> invitations = invitationService.getMeetingInvitations(meetingId);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get meeting invitations: " + e.getMessage()));
        }
    }
    
    /**
     * Get all invitations for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserInvitations(@PathVariable Long userId) {
        try {
            List<Map<String, Object>> invitations = invitationService.getUserInvitations(userId);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get user invitations: " + e.getMessage()));
        }
    }
    
    /**
     * Send bulk invitations to committees and subcommittees
     */
    @PostMapping("/bulk")
    public ResponseEntity<?> sendBulkInvitations(@RequestBody Map<String, Object> request) {
        try {
            Long meetingId = Long.valueOf(request.get("meetingId").toString());
            
            @SuppressWarnings("unchecked")
            List<Integer> committeeIdsInt = (List<Integer>) request.getOrDefault("committees", List.of());
            List<Long> committeeIds = committeeIdsInt.stream()
                    .map(Integer::longValue)
                    .toList();
            
            @SuppressWarnings("unchecked")
            List<Integer> subcommitteeIdsInt = (List<Integer>) request.getOrDefault("subcommittees", List.of());
            List<Long> subcommitteeIds = subcommitteeIdsInt.stream()
                    .map(Integer::longValue)
                    .toList();
            
            Boolean sendEmail = (Boolean) request.getOrDefault("sendEmail", true);
            String message = (String) request.get("message");
            
            Map<String, Object> result = invitationService.sendBulkInvitations(
                meetingId, committeeIds, subcommitteeIds, message, sendEmail);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to send bulk invitations: " + e.getMessage()));
        }
    }
    
    /**
     * Send invitations to committee members for a specific meeting
     */
    @PostMapping("/committee-invitations/send/{meetingId}")
    public ResponseEntity<?> sendCommitteeInvitations(
            @PathVariable Long meetingId,
            @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> committeeIdsInt = (List<Integer>) request.getOrDefault("committees", List.of());
            List<Long> committeeIds = committeeIdsInt.stream()
                    .map(Integer::longValue)
                    .toList();
            
            @SuppressWarnings("unchecked")
            List<Integer> subcommitteeIdsInt = (List<Integer>) request.getOrDefault("subcommittees", List.of());
            List<Long> subcommitteeIds = subcommitteeIdsInt.stream()
                    .map(Integer::longValue)
                    .toList();
            
            Boolean sendEmail = (Boolean) request.getOrDefault("sendEmail", true);
            String message = (String) request.get("message");
            
            Map<String, Object> result = invitationService.sendBulkInvitations(
                meetingId, committeeIds, subcommitteeIds, message, sendEmail);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to send committee invitations: " + e.getMessage()));
        }
    }

    /**
     * Respond to an invitation
     */
    @PostMapping("/{invitationId}/respond")
    public ResponseEntity<?> respondToInvitation(
            @PathVariable Long invitationId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String comment = request.get("comment");
            
            Map<String, Object> result = invitationService.respondToInvitation(invitationId, status, comment);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to respond to invitation: " + e.getMessage()));
        }
    }
}