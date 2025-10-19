package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.model.SubCommittee;
import com.earacg.earaconnect.service.SubCommitteeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sub-committees")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class SubCommitteeController {

    private final SubCommitteeService subCommitteeService;

    public SubCommitteeController(SubCommitteeService subCommitteeService) {
        this.subCommitteeService = subCommitteeService;
    }

    // Create
    @PostMapping
    public SubCommittee createSubCommittee(@RequestBody SubCommittee subCommittee) {
        return subCommitteeService.createSubCommittee(subCommittee);
    }

    // Read (all)
    @GetMapping
    public List<SubCommittee> getAllSubCommittees() {
        return subCommitteeService.getAllSubCommittees();
    }

    // Read (by id)
    @GetMapping("/{id}")
    public ResponseEntity<SubCommittee> getSubCommitteeById(@PathVariable Long id) {
        Optional<SubCommittee> subCommittee = subCommitteeService.getSubCommitteeById(id);
        return subCommittee.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<SubCommittee> updateSubCommittee(@PathVariable Long id, @RequestBody SubCommittee subCommitteeDetails) {
        try {
            SubCommittee updatedSubCommittee = subCommitteeService.updateSubCommittee(id, subCommitteeDetails);
            return ResponseEntity.ok(updatedSubCommittee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubCommittee(@PathVariable Long id) {
        try {
            subCommitteeService.deleteSubCommittee(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}