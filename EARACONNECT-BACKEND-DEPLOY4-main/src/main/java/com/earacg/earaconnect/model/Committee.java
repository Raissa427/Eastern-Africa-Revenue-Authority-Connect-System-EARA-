package com.earacg.earaconnect.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "committee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Committee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "committee_name")
    private String name;

    @OneToMany(mappedBy = "parentCommittee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SubCommittee> subCommittees;
}
