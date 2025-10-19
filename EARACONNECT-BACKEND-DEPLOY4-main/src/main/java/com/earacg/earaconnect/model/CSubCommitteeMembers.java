package com.earacg.earaconnect.model;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CSubCommitteeMembers {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String phone;
    private String email;
    
    @Column(name = "position_in_ra")
    private String positionInYourRA;

    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;
    
    @ManyToOne
    @JoinColumn(name = "position_in_ear")
    private SubCommittee subCommittee;
    
    @Column(name = "appointed_date")
    private LocalDate appointedDate;
    
    // Changed to reference Document entity instead of storing filename directly
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "appointed_letter_doc_id")
    private Document appointedLetterDoc;

    @Column(name = "secretary_of_delegation")
    @JsonProperty("isDelegationSecretary")
    private boolean isDelegationSecretary;
    
    @Column(name = "chair")
    @JsonProperty("isChair")
    private boolean isChair;
    
    @Column(name = "vice_chair")
    @JsonProperty("isViceChair")
    private boolean isViceChair;
    
    @Column(name = "committee_secretary")
    @JsonProperty("isCommitteeSecretary")
    private boolean isCommitteeSecretary;

    @Column(name = "committee_member")
    @JsonProperty("isCommitteeMember")
    private boolean isCommitteeMember;
    
    // New field for user role
    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private User.UserRole userRole;
    
    // Helper method to determine role based on boolean fields
    public User.UserRole determineUserRole() {
        if (isChair) {
            return User.UserRole.CHAIR;
        } else if (isCommitteeSecretary) {
            return User.UserRole.COMMITTEE_SECRETARY;
        } else if (isDelegationSecretary) {
            return User.UserRole.DELEGATION_SECRETARY;
        } else if (isViceChair) {
            return User.UserRole.VICE_CHAIR;
        } else if (isCommitteeMember) {
            return User.UserRole.COMMITTEE_MEMBER;
        } else {
            return User.UserRole.SUBCOMMITTEE_MEMBER;
        }
    }
}