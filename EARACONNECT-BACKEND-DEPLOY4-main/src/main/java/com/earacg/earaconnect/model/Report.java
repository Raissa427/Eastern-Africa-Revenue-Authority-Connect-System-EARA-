package com.earacg.earaconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resolution_id", nullable = false)
    @JsonBackReference("resolution-reports")
    private Resolution resolution;

    @ManyToOne
    @JoinColumn(name = "subcommittee_id", nullable = false)
    @JsonIgnoreProperties({"assignments", "members", "reports"})
    private SubCommittee subcommittee;

    @ManyToOne
    @JoinColumn(name = "submitted_by", nullable = false)
    @JsonIgnoreProperties({"resolutions", "meetings", "country", "subcommittee", "reports"})
    private User submittedBy;

    @Column(name = "performance_percentage", nullable = false)
    private Integer performancePercentage;

    @Column(name = "progress_details", columnDefinition = "TEXT")
    private String progressDetails;

    @Column(name = "hindrances", columnDefinition = "TEXT")
    private String hindrances;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.SUBMITTED;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_hod")
    private User reviewedByHod;

    @Column(name = "hod_comments", columnDefinition = "TEXT")
    private String hodComments;

    @Column(name = "hod_reviewed_at")
    private LocalDateTime hodReviewedAt;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_commissioner")
    private User reviewedByCommissioner;

    @Column(name = "commissioner_comments", columnDefinition = "TEXT")
    private String commissionerComments;

    @Column(name = "commissioner_reviewed_at")
    private LocalDateTime commissionerReviewedAt;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_final_report", nullable = false)
    private Boolean isFinalReport = false;

    @Column(name = "report_version", nullable = false)
    private Integer reportVersion = 1;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        if (isFinalReport == null) {
            isFinalReport = false;
        }
        if (reportVersion == null) {
            reportVersion = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ReportStatus {
        SUBMITTED,
        APPROVED_BY_HOD,
        REJECTED_BY_HOD,
        APPROVED_BY_COMMISSIONER,
        REJECTED_BY_COMMISSIONER
    }
} 