package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.CSubCommitteeMembers;
import com.earacg.earaconnect.model.Document;
import com.earacg.earaconnect.repository.CSubCommitteeMembersRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;
import com.earacg.earaconnect.model.User;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CSubCommitteeMembersService {

    private final CSubCommitteeMembersRepo repository;
    private final DocumentService documentService;
    private final UserService userService;


    /**
     * Create new committee member
     */
    public CSubCommitteeMembers create(CSubCommitteeMembers member, MultipartFile appointmentLetter) {
        log.info("[DESERIALIZED] Received member: Name={}, isDelegationSecretary={}, isChair={}, isViceChair={}, isCommitteeSecretary={}, isCommitteeMember={}, AppointedDate={}",
                member.getName(), member.isDelegationSecretary(), member.isChair(), member.isViceChair(),
                member.isCommitteeSecretary(), member.isCommitteeMember(), member.getAppointedDate());
        log.info("Creating member: Name={}, Chair={}, ViceChair={}, DelegationSecretary={}, CommitteeSecretary={}, CommitteeMember={}, AppointedDate={}",
                member.getName(), member.isChair(), member.isViceChair(), member.isDelegationSecretary(),
                member.isCommitteeSecretary(), member.isCommitteeMember(), member.getAppointedDate());

        // Debug subcommittee assignment
        log.info("🔍 CSubCommitteeMembersService: Member subcommittee assignment - SubCommittee: {}", member.getSubCommittee());
        if (member.getSubCommittee() != null) {
            log.info("🔍 CSubCommitteeMembersService: Subcommittee ID: {}, Name: {}", 
                    member.getSubCommittee().getId(), member.getSubCommittee().getName());
        } else {
            log.warn("⚠️ CSubCommitteeMembersService: Member {} has NULL subcommittee assignment!", member.getName());
        }

        // Validate appointment date - must be in the past or today
        validateAppointmentDate(member.getAppointedDate());
        
        // Validate that at least one role is assigned
        validateRoleAssignment(member);
        validateMaxTwoRoles(member);

        if (appointmentLetter != null && !appointmentLetter.isEmpty()) {
            Document document = documentService.storeFile(appointmentLetter);
            member.setAppointedLetterDoc(document);
        }

        // Set the user role before saving
        member.setUserRole(member.determineUserRole());
        
        CSubCommitteeMembers savedMember = repository.save(member);
        log.info("✅ CSubCommitteeMembersService: Saved member {} with subcommittee: {}", 
                savedMember.getName(), savedMember.getSubCommittee() != null ? savedMember.getSubCommittee().getName() : "NULL");

        // Sync to users table and send credentials if needed
        syncMemberToUser(savedMember);

        log.info("Successfully saved member: Name={}, ID={}, Chair={}, ViceChair={}, DelegationSecretary={}, CommitteeSecretary={}, CommitteeMember={}, AppointedDate={}",
                savedMember.getName(), savedMember.getId(), savedMember.isChair(), savedMember.isViceChair(),
                savedMember.isDelegationSecretary(), savedMember.isCommitteeSecretary(),
                savedMember.isCommitteeMember(), savedMember.getAppointedDate());

        return savedMember;
    }

    /**
     * Get all committee members with pagination
     */
    @Transactional(readOnly = true)
    public Page<CSubCommitteeMembers> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    /**
     * Get all committee members
     */
    @Transactional(readOnly = true)
    public List<CSubCommitteeMembers> findAll() {
        return repository.findAll();
    }

    /**
     * Get committee member by ID
     */
    @Transactional(readOnly = true)
    public CSubCommitteeMembers findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Committee member not found with id: " + id));
    }

    /**
     * Update committee member
     */
    public CSubCommitteeMembers update(Long id, CSubCommitteeMembers updatedMember, MultipartFile newAppointmentLetter) {
        log.info("[DESERIALIZED] Received member (update): Name={}, isDelegationSecretary={}, isChair={}, isViceChair={}, isCommitteeSecretary={}, isCommitteeMember={}, AppointedDate={}",
                updatedMember.getName(), updatedMember.isDelegationSecretary(), updatedMember.isChair(), updatedMember.isViceChair(),
                updatedMember.isCommitteeSecretary(), updatedMember.isCommitteeMember(), updatedMember.getAppointedDate());
        log.info("Updating member with ID {}: Name={}, Chair={}, ViceChair={}, DelegationSecretary={}, CommitteeSecretary={}, CommitteeMember={}, AppointedDate={}",
                id, updatedMember.getName(), updatedMember.isChair(), updatedMember.isViceChair(),
                updatedMember.isDelegationSecretary(), updatedMember.isCommitteeSecretary(),
                updatedMember.isCommitteeMember(), updatedMember.getAppointedDate());

        CSubCommitteeMembers existingMember = findById(id);

        // Validate appointment date - must be in the past or today
        validateAppointmentDate(updatedMember.getAppointedDate());
        
        // Validate that at least one role is assigned
        validateRoleAssignment(updatedMember);
        validateMaxTwoRoles(updatedMember);

        // Update basic fields
        existingMember.setName(updatedMember.getName());
        existingMember.setPhone(updatedMember.getPhone());
        existingMember.setEmail(updatedMember.getEmail());
        existingMember.setPositionInYourRA(updatedMember.getPositionInYourRA());
        existingMember.setCountry(updatedMember.getCountry());
        existingMember.setSubCommittee(updatedMember.getSubCommittee());
        existingMember.setAppointedDate(updatedMember.getAppointedDate());
        existingMember.setDelegationSecretary(updatedMember.isDelegationSecretary());
        existingMember.setChair(updatedMember.isChair());
        existingMember.setViceChair(updatedMember.isViceChair());
        existingMember.setCommitteeSecretary(updatedMember.isCommitteeSecretary());
        existingMember.setCommitteeMember(updatedMember.isCommitteeMember());
        
        // Update the user role based on new roles
        existingMember.setUserRole(existingMember.determineUserRole());

        // Handle new appointment letter upload
        if (newAppointmentLetter != null && !newAppointmentLetter.isEmpty()) {
            if (existingMember.getAppointedLetterDoc() != null) {
                documentService.deleteDocument(existingMember.getAppointedLetterDoc().getId());
            }
            Document newDocument = documentService.storeFile(newAppointmentLetter);
            existingMember.setAppointedLetterDoc(newDocument);
        }

        CSubCommitteeMembers savedMember = repository.save(existingMember);

        // Sync to users table and update roles if needed
        syncMemberToUser(savedMember);

        log.info("Successfully updated member: Name={}, ID={}, Chair={}, ViceChair={}, DelegationSecretary={}, CommitteeSecretary={}, CommitteeMember={}, AppointedDate={}",
                savedMember.getName(), savedMember.getId(), savedMember.isChair(), savedMember.isViceChair(),
                savedMember.isDelegationSecretary(), savedMember.isCommitteeSecretary(),
                savedMember.isCommitteeMember(), savedMember.getAppointedDate());

        return savedMember;
    }

    /**
     * Delete committee member
     */
    public void delete(Long id) {
        log.info("Deleting committee member with id: {}", id);

        CSubCommitteeMembers member = findById(id);

        // Delete associated document if exists
        if (member.getAppointedLetterDoc() != null) {
            documentService.deleteDocument(member.getAppointedLetterDoc().getId());
        }

        repository.deleteById(id);
    }

    /**
     * Find members by country
     */
    @Transactional(readOnly = true)
    public List<CSubCommitteeMembers> findByCountryId(Long countryId) {
        return repository.findByCountryId(countryId);
    }

    /**
     * Find members by sub-committee
     */
    @Transactional(readOnly = true)
    public List<CSubCommitteeMembers> findBySubCommitteeId(Long subCommitteeId) {
        return repository.findBySubCommitteeId(subCommitteeId);
    }

    /**
     * Find chairs
     */
    @Transactional(readOnly = true)
    public List<CSubCommitteeMembers> findChairs() {
        return repository.findByIsChairTrue();
    }

    /**
     * Find vice chairs
     */
    @Transactional(readOnly = true)
    public List<CSubCommitteeMembers> findViceChairs() {
        return repository.findByIsViceChairTrue();
    }

    /**
     * Find delegation secretaries
     */
    @Transactional(readOnly = true)
    public List<CSubCommitteeMembers> findDelegationSecretaries() {
        return repository.findByIsDelegationSecretaryTrue();
    }

    /**
     * Search members by name
     */
    @Transactional(readOnly = true)
    public List<CSubCommitteeMembers> searchByName(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Check if member exists by email
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    public List<CSubCommitteeMembers> findDelegationSecretariesByCountryId(Long countryId) {
        return repository.findByCountryIdAndIsDelegationSecretaryTrue(countryId);
    }

    /**
     * Validate that the appointment date is not in the future
     */
    private void validateAppointmentDate(LocalDate appointedDate) {
        if (appointedDate != null && appointedDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the future. Please select a date that is today or in the past.");
        }
    }

    /**
     * Validate that at least one role is assigned to the member
     */
    private void validateRoleAssignment(CSubCommitteeMembers member) {
        log.info("Validating role assignment for member: {}", member.getName());
        log.info("Role values - Chair: {}, ViceChair: {}, DelegationSecretary: {}, CommitteeSecretary: {}, CommitteeMember: {}", 
                member.isChair(), member.isViceChair(), member.isDelegationSecretary(), 
                member.isCommitteeSecretary(), member.isCommitteeMember());
        
        if (!member.isChair() && !member.isViceChair() && !member.isDelegationSecretary()
                && !member.isCommitteeSecretary() && !member.isCommitteeMember()) {
            throw new IllegalArgumentException("At least one role must be assigned to the committee member.");
        }
    }

    /**
     * Validate that no more than two roles are assigned
     */
    private void validateMaxTwoRoles(CSubCommitteeMembers member) {
        int count = 0;
        if (member.isChair()) count++;
        if (member.isViceChair()) count++;
        if (member.isDelegationSecretary()) count++;
        if (member.isCommitteeSecretary()) count++;
        if (member.isCommitteeMember()) count++;
        if (count > 2) {
            throw new IllegalArgumentException("A maximum of two roles can be assigned to the committee member.");
        }
    }

    /**
     * Sync committee member to users table and assign roles. Creates user if not exists, updates roles if exists.
     */
    private void syncMemberToUser(CSubCommitteeMembers member) {
        if (member.getEmail() == null || member.getEmail().isEmpty()) {
            log.warn("Committee member {} has no email, cannot sync to user.", member.getName());
            return;
        }
        
        // Debug logging for subcommittee assignment
        log.info("🔍 CSubCommitteeMembersService: Syncing member {} to user", member.getName());
        log.info("🔍 CSubCommitteeMembersService: Member subcommittee: {}", member.getSubCommittee());
        if (member.getSubCommittee() != null) {
            log.info("🔍 CSubCommitteeMembersService: Subcommittee ID: {}, Name: {}", 
                    member.getSubCommittee().getId(), member.getSubCommittee().getName());
        } else {
            log.warn("⚠️ CSubCommitteeMembersService: Member {} has NULL subcommittee!", member.getName());
        }
        
        // Determine the primary role based on member roles
        User.UserRole primaryRole = determinePrimaryRole(member);
        log.info("🔍 CSubCommitteeMembersService: Determined primary role: {}", primaryRole);
        
        // Check if user exists
        Optional<User> userOpt = userService.getUserByEmail(member.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(primaryRole);
            user.setName(member.getName());
            user.setEmail(member.getEmail());
            user.setSubcommittee(member.getSubCommittee()); // Ensure subcommittee is set for existing users too
            userService.updateUser(user.getId(), user);
            log.info("✅ CSubCommitteeMembersService: Updated existing user {} with role {} and subcommittee {}", 
                    user.getEmail(), primaryRole, member.getSubCommittee() != null ? member.getSubCommittee().getName() : "NULL");
        } else {
            // Create new user - UserService will handle password generation and email sending
            User newUser = new User();
            newUser.setEmail(member.getEmail());
            newUser.setName(member.getName());
            newUser.setPhone(member.getPhone());
            newUser.setRole(primaryRole);
            newUser.setCountry(member.getCountry());
            newUser.setSubcommittee(member.getSubCommittee());
            newUser.setActive(true);
            userService.createUser(newUser);
            log.info("✅ CSubCommitteeMembersService: Created new user {} with role {} and subcommittee {}", 
                    newUser.getEmail(), primaryRole, member.getSubCommittee() != null ? member.getSubCommittee().getName() : "NULL");
        }
    }
    
    /**
     * Determine the primary role based on member's assigned roles
     */
    private User.UserRole determinePrimaryRole(CSubCommitteeMembers member) {
        if (member.isChair()) {
            return User.UserRole.CHAIR;
        } else if (member.isViceChair()) {
            return User.UserRole.VICE_CHAIR;
        } else if (member.isCommitteeSecretary()) {
            return User.UserRole.COMMITTEE_SECRETARY;
        } else if (member.isDelegationSecretary()) {
            return User.UserRole.DELEGATION_SECRETARY;
        } else if (member.isCommitteeMember()) {
            return User.UserRole.COMMITTEE_MEMBER;
        } else {
            return User.UserRole.SUBCOMMITTEE_MEMBER;
        }
    }
}