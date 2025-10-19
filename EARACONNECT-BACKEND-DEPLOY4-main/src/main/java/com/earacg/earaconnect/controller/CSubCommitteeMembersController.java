package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.model.CSubCommitteeMembers;
import com.earacg.earaconnect.model.Document;
import com.earacg.earaconnect.service.CSubCommitteeMembersService;
import com.earacg.earaconnect.service.DocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/country-committee-members")
@RequiredArgsConstructor
@Slf4j
public class CSubCommitteeMembersController {

    private final CSubCommitteeMembersService service;
    private final DocumentService documentService;
    private final ObjectMapper objectMapper;

    /**
     * Create new committee member
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestParam("member") String memberJson,
            @RequestParam(value = "appointmentLetter", required = false) MultipartFile appointmentLetter) {
        try {
            log.info("Received member JSON: {}", memberJson);
            log.info("Received file: {}", appointmentLetter != null ? appointmentLetter.getOriginalFilename() : "none");

            // Parse JSON string to CSubCommitteeMembers object
            CSubCommitteeMembers member = objectMapper.readValue(memberJson, CSubCommitteeMembers.class);

            // Input validation
            if (member.getName() == null || member.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name is required."));
            }
            if (member.getEmail() == null || member.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
            }
            if (member.getAppointedDate() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Appointed date is required."));
            }
            // Appointed date validation
            if (member.getAppointedDate().isAfter(java.time.LocalDate.of(2025, 7, 31))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Appointed date cannot be in the future."));
            }
            // Role selection validation
            int roleCount = 0;
            if (member.isChair()) roleCount++;
            if (member.isViceChair()) roleCount++;
            if (member.isCommitteeSecretary()) roleCount++;
            if (member.isDelegationSecretary()) roleCount++;
            if (member.isCommitteeMember()) roleCount++;
            if (roleCount > 2) {
                return ResponseEntity.badRequest().body(Map.of("error", "A member cannot have more than 2 roles."));
            }

            CSubCommitteeMembers createdMember = service.create(member, appointmentLetter);
            // Ensure role is visible in response
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMember);
        } catch (Exception e) {
            log.error("Error creating committee member", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to create committee member: " + e.getMessage()));
        }
    }

    /**
     * Update committee member
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMember(
            @PathVariable Long id,
            @RequestParam("member") String memberJson,
            @RequestParam(value = "appointmentLetter", required = false) MultipartFile appointmentLetter) {
        
        try {
            log.info("Updating member with ID: {}", id);
            log.info("Received member JSON: {}", memberJson);
            log.info("Received file: {}", appointmentLetter != null ? appointmentLetter.getOriginalFilename() : "none");
            
            // Parse JSON string to CSubCommitteeMembers object
            log.info("About to parse JSON: {}", memberJson);
            CSubCommitteeMembers member = objectMapper.readValue(memberJson, CSubCommitteeMembers.class);
            
            log.info("Parsed member object - Name: {}, Chair: {}, ViceChair: {}, DelegationSecretary: {}, CommitteeSecretary: {}, CommitteeMember: {}", 
                    member.getName(), member.isChair(), member.isViceChair(), member.isDelegationSecretary(), 
                    member.isCommitteeSecretary(), member.isCommitteeMember());
            
            CSubCommitteeMembers updatedMember = service.update(id, member, appointmentLetter);
            return ResponseEntity.ok(updatedMember);
        } catch (RuntimeException e) {
            log.error("Error updating committee member", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update committee member: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error parsing member data", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid member data format: " + e.getMessage()));
        }
    }

    // Keep all other existing methods unchanged...
    @GetMapping
    public ResponseEntity<Page<CSubCommitteeMembers>> getAllMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<CSubCommitteeMembers> members = service.findAll(pageable);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CSubCommitteeMembers>> getAllMembersWithoutPagination() {
        List<CSubCommitteeMembers> members = service.findAll();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMemberById(@PathVariable Long id) {
        try {
            CSubCommitteeMembers member = service.findById(id);
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(Map.of("message", "Committee member deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting committee member", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to delete committee member: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/appointment-letter")
    public ResponseEntity<Resource> downloadAppointmentLetter(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        try {
            CSubCommitteeMembers member = service.findById(id);
            
            if (member.getAppointedLetterDoc() == null) {
                return ResponseEntity.notFound().build();
            }
            
            Document document = member.getAppointedLetterDoc();
            Resource resource = documentService.loadFileAsResource(document.getStoredFilename());
            
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                log.info("Could not determine file type.");
            }
            
            if (contentType == null) {
                contentType = document.getContentType();
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Error downloading appointment letter", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/appointment-letter/view")
    public ResponseEntity<Resource> viewAppointmentLetter(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        try {
            CSubCommitteeMembers member = service.findById(id);
            
            if (member.getAppointedLetterDoc() == null) {
                return ResponseEntity.notFound().build();
            }
            
            Document document = member.getAppointedLetterDoc();
            Resource resource = documentService.loadFileAsResource(document.getStoredFilename());
            
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                log.info("Could not determine file type.");
            }
            
            if (contentType == null) {
                contentType = document.getContentType();
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Error viewing appointment letter", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<CSubCommitteeMembers>> searchMembers(
            @RequestParam String name) {
        List<CSubCommitteeMembers> members = service.searchByName(name);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/country/{countryId}")
    public ResponseEntity<List<CSubCommitteeMembers>> getMembersByCountry(
            @PathVariable Long countryId) {
        List<CSubCommitteeMembers> members = service.findByCountryId(countryId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/sub-committee/{subCommitteeId}")
    public ResponseEntity<List<CSubCommitteeMembers>> getMembersBySubCommittee(
            @PathVariable Long subCommitteeId) {
        List<CSubCommitteeMembers> members = service.findBySubCommitteeId(subCommitteeId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/chairs")
    public ResponseEntity<List<CSubCommitteeMembers>> getChairs() {
        List<CSubCommitteeMembers> chairs = service.findChairs();
        return ResponseEntity.ok(chairs);
    }

    @GetMapping("/vice-chairs")
    public ResponseEntity<List<CSubCommitteeMembers>> getViceChairs() {
        List<CSubCommitteeMembers> viceChairs = service.findViceChairs();
        return ResponseEntity.ok(viceChairs);
    }

    @GetMapping("/delegation-secretaries")
    public ResponseEntity<List<CSubCommitteeMembers>> getDelegationSecretaries() {
        List<CSubCommitteeMembers> secretaries = service.findDelegationSecretaries();
        return ResponseEntity.ok(secretaries);
    }

    @GetMapping("/email-exists")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = service.existsByEmail(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * Get member count for a specific subcommittee
     * GET /api/country-committee-members/sub-committee/{subCommitteeId}/count
     */
    @GetMapping("/sub-committee/{subCommitteeId}/count")
    public ResponseEntity<Map<String, Object>> getSubcommitteeMemberCount(@PathVariable Long subCommitteeId) {
        try {
            List<CSubCommitteeMembers> members = service.findBySubCommitteeId(subCommitteeId);
            Map<String, Object> response = Map.of(
                "subCommitteeId", subCommitteeId,
                "memberCount", members.size(),
                "members", members
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting subcommittee member count for ID: " + subCommitteeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get member count for a specific committee
     * GET /api/country-committee-members/committee/{committeeId}/count
     */
    @GetMapping("/committee/{committeeId}/count")
    public ResponseEntity<Map<String, Object>> getCommitteeMemberCount(@PathVariable Long committeeId) {
        try {
            // For now, return all members since the data model stores all members as CSubCommitteeMembers
            // This is a workaround until the committee-member relationship is properly established
            List<CSubCommitteeMembers> allMembers = service.findAll();
            Map<String, Object> response = Map.of(
                "committeeId", committeeId,
                "memberCount", allMembers.size(),
                "members", allMembers
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting committee member count for ID: " + committeeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all committees with their member counts
     * GET /api/country-committee-members/committees/with-counts
     */
    @GetMapping("/committees/with-counts")
    public ResponseEntity<List<Map<String, Object>>> getAllCommitteesWithMemberCounts() {
        try {
            // This is a temporary solution - in the future, we should have a proper committee-member relationship
            List<CSubCommitteeMembers> allMembers = service.findAll();
            
            // For now, return the two main committees with distributed member counts
            List<Map<String, Object>> committeesWithCounts = List.of(
                Map.of(
                    "id", 1L,
                    "name", "Commissioner General",
                    "memberCount", Math.ceil(allMembers.size() / 2.0)
                ),
                Map.of(
                    "id", 2L,
                    "name", "Head Of Delegation",
                    "memberCount", Math.floor(allMembers.size() / 2.0)
                )
            );
            
            return ResponseEntity.ok(committeesWithCounts);
        } catch (Exception e) {
            log.error("Error getting committees with member counts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all subcommittees with their member counts
     * GET /api/country-committee-members/subcommittees/with-counts
     */
    @GetMapping("/subcommittees/with-counts")
    public ResponseEntity<List<Map<String, Object>>> getAllSubcommitteesWithMemberCounts() {
        try {
            // Get all subcommittees from the SubCommittee table
            // For now, we'll use a hardcoded list and get member counts for each
            List<Map<String, Object>> subcommittees = List.of(
                Map.of("id", 1L, "name", "Head Of Delegation"),
                Map.of("id", 2L, "name", "Domestic Revenue Sub Committee"),
                Map.of("id", 3L, "name", "Customs Revenue Sub Committee"),
                Map.of("id", 4L, "name", "IT Sub Committee"),
                Map.of("id", 5L, "name", "Legal Sub Committee"),
                Map.of("id", 6L, "name", "HR Sub Committee"),
                Map.of("id", 7L, "name", "Research Sub Committee")
            );
            
            List<Map<String, Object>> subcommitteesWithCounts = new ArrayList<>();
            
            for (Map<String, Object> subcommittee : subcommittees) {
                Long subcommitteeId = (Long) subcommittee.get("id");
                List<CSubCommitteeMembers> members = service.findBySubCommitteeId(subcommitteeId);
                
                Map<String, Object> subcommitteeWithCount = new HashMap<>(subcommittee);
                subcommitteeWithCount.put("memberCount", members.size());
                subcommitteesWithCounts.add(subcommitteeWithCount);
            }
            
            return ResponseEntity.ok(subcommitteesWithCounts);
        } catch (Exception e) {
            log.error("Error getting subcommittees with member counts", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}