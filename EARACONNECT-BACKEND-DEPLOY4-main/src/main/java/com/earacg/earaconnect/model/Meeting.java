package com.earacg.earaconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "agenda")
    private String agenda;

    @Column(name = "meeting_date", nullable = false)
    private LocalDateTime meetingDate;

    @Column(name = "location")
    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "invitation_pdf")
    private String invitationPdf;

    @ManyToOne
    @JoinColumn(name = "hosting_country_id", nullable = false)
    @JsonIgnoreProperties({"eac"})
    private Country hostingCountry;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnoreProperties({"password", "country", "subcommittee", "resolutions", "meetings"})
    private User createdBy;

    @Column(name = "meeting_type")
    @Enumerated(EnumType.STRING)
    private MeetingType meetingType;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    @Column(name = "minutes")
    private String minutes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<MeetingInvitation> invitations;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Resolution> resolutions;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum MeetingType {
        COMMISSIONER_GENERAL_MEETING,
        TECHNICAL_MEETING,
        SUBCOMMITTEE_MEETING
    }

    public enum MeetingStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
} 