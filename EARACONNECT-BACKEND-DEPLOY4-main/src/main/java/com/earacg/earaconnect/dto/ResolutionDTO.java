package com.earacg.earaconnect.dto;

import com.earacg.earaconnect.model.Resolution;
import java.time.LocalDateTime;

public class ResolutionDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Meeting info (simplified)
    private Long meetingId;
    private String meetingTitle;
    
    // Created by info (simplified)
    private Long createdById;
    private String createdByName;

    // Constructors
    public ResolutionDTO() {}

    public ResolutionDTO(Resolution resolution) {
        this.id = resolution.getId();
        this.title = resolution.getTitle();
        this.description = resolution.getDescription();
        this.status = resolution.getStatus() != null ? resolution.getStatus().toString() : null;
        this.createdAt = resolution.getCreatedAt();
        this.updatedAt = resolution.getUpdatedAt();
        
        if (resolution.getMeeting() != null) {
            this.meetingId = resolution.getMeeting().getId();
            this.meetingTitle = resolution.getMeeting().getTitle();
        }
        
        if (resolution.getCreatedBy() != null) {
            this.createdById = resolution.getCreatedBy().getId();
            this.createdByName = resolution.getCreatedBy().getName();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getMeetingId() { return meetingId; }
    public void setMeetingId(Long meetingId) { this.meetingId = meetingId; }

    public String getMeetingTitle() { return meetingTitle; }
    public void setMeetingTitle(String meetingTitle) { this.meetingTitle = meetingTitle; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
}