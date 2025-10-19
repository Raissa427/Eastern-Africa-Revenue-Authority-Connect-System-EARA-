package com.earacg.earaconnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "eac")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Eac {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}
