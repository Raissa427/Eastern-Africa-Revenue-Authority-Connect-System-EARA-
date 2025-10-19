package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.MeetingInvitation;
import com.earacg.earaconnect.repository.MeetingInvitationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingInvitationService {

    @Autowired
    private MeetingInvitationRepo meetingInvitationRepo;

    public List<MeetingInvitation> getAllInvitations() {
        return meetingInvitationRepo.findAll();
    }

    public Optional<MeetingInvitation> getInvitationById(Long id) {
        return meetingInvitationRepo.findById(id);
    }

    public List<MeetingInvitation> getInvitationsByMeeting(Long meetingId) {
        return meetingInvitationRepo.findByMeetingId(meetingId);
    }

    public List<MeetingInvitation> getInvitationsByUser(Long userId) {
        return meetingInvitationRepo.findByUserId(userId);
    }

    public List<MeetingInvitation> getInvitationsByStatus(MeetingInvitation.InvitationStatus status) {
        return meetingInvitationRepo.findByStatus(status);
    }

    public MeetingInvitation createInvitation(MeetingInvitation invitation) {
        if (invitation.getMeeting() == null || invitation.getUser() == null) {
            return null;
        }
        
        invitation.setSentAt(LocalDateTime.now());
        invitation.setStatus(MeetingInvitation.InvitationStatus.PENDING);
        
        return meetingInvitationRepo.save(invitation);
    }

    public MeetingInvitation updateInvitation(Long id, MeetingInvitation invitationDetails) {
        Optional<MeetingInvitation> invitationOpt = meetingInvitationRepo.findById(id);
        if (invitationOpt.isPresent()) {
            MeetingInvitation invitation = invitationOpt.get();
            
            if (invitationDetails.getStatus() != null) {
                invitation.setStatus(invitationDetails.getStatus());
            }
            
            if (invitationDetails.getResponseComment() != null) {
                invitation.setResponseComment(invitationDetails.getResponseComment());
            }
            
            if (invitationDetails.getStatus() != null && 
                invitationDetails.getStatus() != MeetingInvitation.InvitationStatus.PENDING) {
                invitation.setRespondedAt(LocalDateTime.now());
            }
            
            return meetingInvitationRepo.save(invitation);
        }
        return null;
    }

    public boolean deleteInvitation(Long id) {
        if (meetingInvitationRepo.existsById(id)) {
            meetingInvitationRepo.deleteById(id);
            return true;
        }
        return false;
    }

    public MeetingInvitation respondToInvitation(Long id, MeetingInvitation.InvitationStatus status, String comment) {
        Optional<MeetingInvitation> invitationOpt = meetingInvitationRepo.findById(id);
        if (invitationOpt.isPresent()) {
            MeetingInvitation invitation = invitationOpt.get();
            
            invitation.setStatus(status);
            invitation.setResponseComment(comment);
            invitation.setRespondedAt(LocalDateTime.now());
            
            return meetingInvitationRepo.save(invitation);
        }
        return null;
    }
}
