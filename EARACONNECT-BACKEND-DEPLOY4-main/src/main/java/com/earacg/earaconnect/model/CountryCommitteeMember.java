package com.earacg.earaconnect.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CountryCommitteeMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String phone;
    private String email;

    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;

    @ManyToOne
    @JoinColumn(name = "committee_id")
    private Committee committee;

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

    // Temporarily commented out until database column is added
    // @Column(name = "commissioner_general")
    // @JsonProperty("isCommissionerGeneral")
    // private boolean isCommissionerGeneral;
}