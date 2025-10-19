package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.CountryCommitteeMember;
import com.earacg.earaconnect.model.User;
import com.earacg.earaconnect.repository.CountryCommitteeMemberRepo;
import com.earacg.earaconnect.repository.UserRepo;
import com.earacg.earaconnect.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CountryCommitteeMemberService {

    @Autowired
    private CountryCommitteeMemberRepo countryCommitteeMemberRepo;
    
    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private EmailService emailService;

    // Create
    public CountryCommitteeMember save(CountryCommitteeMember member) {
        log.info("🔍 CountryCommitteeMemberService: Creating/updating Commissioner General member: {}", member.getName());
        
        // Save the committee member first
        CountryCommitteeMember savedMember = countryCommitteeMemberRepo.save(member);
        
        // Sync to users table and send credentials if needed
        syncMemberToUser(savedMember);
        
        log.info("✅ CountryCommitteeMemberService: Successfully saved Commissioner General member: {}", savedMember.getName());
        
        return savedMember;
    }

    // Read (single)
    public Optional<CountryCommitteeMember> findById(Long id) {
        return countryCommitteeMemberRepo.findById(id);
    }

    // Read (all)
    public List<CountryCommitteeMember> findAll() {
        return countryCommitteeMemberRepo.findAll();
    }

    // Update
    public CountryCommitteeMember update(CountryCommitteeMember member) {
        log.info("🔍 CountryCommitteeMemberService: Updating Commissioner General member: {}", member.getName());
        
        // Update the committee member
        CountryCommitteeMember updatedMember = countryCommitteeMemberRepo.save(member);
        
        // Sync to users table and send credentials if needed
        syncMemberToUser(updatedMember);
        
        log.info("✅ CountryCommitteeMemberService: Successfully updated Commissioner General member: {}", updatedMember.getName());
        
        return updatedMember;
    }

    // Delete
    public void deleteById(Long id) {
        countryCommitteeMemberRepo.deleteById(id);
    }

    /**
     * Get all members from a specific committee by committee ID
     */
    public List<CountryCommitteeMember> getMembersByCommitteeId(Long committeeId) {
        return countryCommitteeMemberRepo.findByCommitteeId(committeeId);
    }
    
    /**
     * Get all chairs from a specific committee
     */
    public List<CountryCommitteeMember> getChairsByCommitteeId(Long committeeId) {
        return countryCommitteeMemberRepo.findChairsByCommitteeId(committeeId);
    }
    
    /**
     * Get all vice chairs from a specific committee
     */
    public List<CountryCommitteeMember> getViceChairsByCommitteeId(Long committeeId) {
        return countryCommitteeMemberRepo.findViceChairsByCommitteeId(committeeId);
    }
    
    /**
     * Get all secretaries from a specific committee
     */
    public List<CountryCommitteeMember> getSecretariesByCommitteeId(Long committeeId) {
        return countryCommitteeMemberRepo.findSecretariesByCommitteeId(committeeId);
    }
    
    /**
     * Get all regular members from a specific committee
     */
    public List<CountryCommitteeMember> getRegularMembersByCommitteeId(Long committeeId) {
        return countryCommitteeMemberRepo.findRegularMembersByCommitteeId(committeeId);
    }
    
    /**
     * Get a specific committee member by ID
     */
    public Optional<CountryCommitteeMember> getMemberById(Long memberId) {
        return countryCommitteeMemberRepo.findById(memberId);
    }
    
    /**
     * Get all committee members
     */
    public List<CountryCommitteeMember> getAllMembers() {
        return countryCommitteeMemberRepo.findAll();
    }

    public List<CountryCommitteeMember> findByCountryId(Long countryId) {
        return countryCommitteeMemberRepo.findByCountryId(countryId);
    }
    
    /**
     * Sync committee member to users table and assign roles. Creates user if not exists, updates roles if exists.
     * This ensures Commissioner Generals can access the system with auto-generated credentials.
     */
    private void syncMemberToUser(CountryCommitteeMember member) {
        if (member.getEmail() == null || member.getEmail().isEmpty()) {
            log.warn("⚠️ CountryCommitteeMemberService: Commissioner General {} has no email, cannot sync to user.", member.getName());
            return;
        }
        
        log.info("🔍 CountryCommitteeMemberService: Syncing Commissioner General {} to user", member.getName());
        log.info("🔍 CountryCommitteeMemberService: Member country: {}", member.getCountry() != null ? member.getCountry().getName() : "NULL");
        log.info("🔍 CountryCommitteeMemberService: Member committee: {}", member.getCommittee() != null ? member.getCommittee().getName() : "NULL");
        
        // Determine the primary role based on member roles
        User.UserRole primaryRole = determinePrimaryRole(member);
        log.info("🔍 CountryCommitteeMemberService: Determined primary role: {}", primaryRole);
        
        // Check if user exists
        Optional<User> userOpt = userRepo.findByEmail(member.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(primaryRole);
            user.setName(member.getName());
            user.setEmail(member.getEmail());
            user.setCountry(member.getCountry());
            user.setActive(true);
            
            // Generate new password and send credentials for existing users
            String randomPassword = generateRandomPassword();
            user.setPassword(randomPassword);
            
            User savedUser = userRepo.save(user);
            log.info("✅ CountryCommitteeMemberService: Updated existing user {} with role {} and country {}", 
                    user.getEmail(), primaryRole, member.getCountry() != null ? member.getCountry().getName() : "NULL");
            
            // Send new credentials via email
            try {
                emailService.sendCommissionerGeneralCredentials(user.getEmail(), user.getName(), randomPassword);
                log.info("✅ CountryCommitteeMemberService: Sent new Commissioner General credentials email to existing user: {}", user.getEmail());
            } catch (Exception e) {
                log.error("❌ CountryCommitteeMemberService: Failed to send Commissioner General credentials email to existing user: {}", user.getEmail(), e);
            }
            
        } else {
            // Create new user with auto-generated password
            User newUser = new User();
            newUser.setEmail(member.getEmail());
            newUser.setName(member.getName());
            newUser.setPhone(member.getPhone());
            newUser.setRole(primaryRole);
            newUser.setCountry(member.getCountry());
            newUser.setActive(true);
            
            // Generate random password for new users
            String randomPassword = generateRandomPassword();
            newUser.setPassword(randomPassword);
            
            User savedUser = userRepo.save(newUser);
            log.info("✅ CountryCommitteeMemberService: Created new user {} with role {} and country {}", 
                    newUser.getEmail(), primaryRole, member.getCountry() != null ? member.getCountry().getName() : "NULL");
            
            // Send credentials via email
            try {
                emailService.sendCommissionerGeneralCredentials(newUser.getEmail(), newUser.getName(), randomPassword);
                log.info("✅ CountryCommitteeMemberService: Sent Commissioner General credentials email to new user: {}", newUser.getEmail());
            } catch (Exception e) {
                log.error("❌ CountryCommitteeMemberService: Failed to send Commissioner General credentials email to new user: {}", newUser.getEmail(), e);
            }
        }
    }
    
    /**
     * Determine the primary role based on member's assigned roles
     */
    private User.UserRole determinePrimaryRole(CountryCommitteeMember member) {
        // Temporarily use the old logic until database column is added
        if (member.isChair()) {
            return User.UserRole.CHAIR;
        } else if (member.isViceChair()) {
            return User.UserRole.VICE_CHAIR;
        } else if (member.isCommitteeSecretary()) {
            return User.UserRole.COMMITTEE_SECRETARY;
        } else if (member.isCommitteeMember()) {
            return User.UserRole.COMMITTEE_MEMBER;
        } else {
            // Default role for Commissioner Generals
            return User.UserRole.COMMISSIONER_GENERAL;
        }
    }
    
    /**
     * Generate a secure random password for new users
     */
    private String generateRandomPassword() {
        // Generate a 12-character password with letters, numbers, and special characters
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return password.toString();
    }
    
    /**
     * Manually resend credentials for an existing Commissioner General
     * This is useful for users who didn't receive their initial credentials
     */
    public boolean resendCredentials(Long memberId) {
        try {
            Optional<CountryCommitteeMember> memberOpt = findById(memberId);
            if (memberOpt.isPresent()) {
                CountryCommitteeMember member = memberOpt.get();
                
                if (member.getEmail() == null || member.getEmail().isEmpty()) {
                    log.warn("⚠️ CountryCommitteeMemberService: Cannot resend credentials - member {} has no email", member.getName());
                    return false;
                }
                
                // Check if user exists in users table
                Optional<User> userOpt = userRepo.findByEmail(member.getEmail());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    
                    // Generate new password
                    String newPassword = generateRandomPassword();
                    user.setPassword(newPassword);
                    userRepo.save(user);
                    
                    // Send new credentials
                    emailService.sendCommissionerGeneralCredentials(user.getEmail(), user.getName(), newPassword);
                    
                    log.info("✅ CountryCommitteeMemberService: Successfully resent credentials to Commissioner General: {}", member.getName());
                    return true;
                } else {
                    log.warn("⚠️ CountryCommitteeMemberService: User not found for member {}, creating new user", member.getName());
                    // Create new user and send credentials
                    syncMemberToUser(member);
                    return true;
                }
            } else {
                log.warn("⚠️ CountryCommitteeMemberService: Member not found with ID: {}", memberId);
                return false;
            }
        } catch (Exception e) {
            log.error("❌ CountryCommitteeMemberService: Error resending credentials for member ID: {}", memberId, e);
            return false;
        }
    }
    
    /**
     * Check if a Commissioner General has a user account with password
     * Returns password status information
     */
    public Map<String, Object> getPasswordStatus(Long memberId) {
        Map<String, Object> status = new HashMap<>();
        
        try {
            Optional<CountryCommitteeMember> memberOpt = findById(memberId);
            if (memberOpt.isPresent()) {
                CountryCommitteeMember member = memberOpt.get();
                
                status.put("memberId", memberId);
                status.put("memberName", member.getName());
                status.put("memberEmail", member.getEmail());
                status.put("hasEmail", member.getEmail() != null && !member.getEmail().isEmpty());
                
                if (member.getEmail() != null && !member.getEmail().isEmpty()) {
                    // Check if user exists in users table
                    Optional<User> userOpt = userRepo.findByEmail(member.getEmail());
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        status.put("hasUserAccount", true);
                        status.put("userRole", user.getRole());
                        status.put("userActive", user.isActive());
                        status.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
                        status.put("passwordLocation", "users table (secure storage)");
                        status.put("lastLogin", user.getLastLogin());
                    } else {
                        status.put("hasUserAccount", false);
                        status.put("hasPassword", false);
                        status.put("passwordLocation", "No user account exists");
                    }
                } else {
                    status.put("hasUserAccount", false);
                    status.put("hasPassword", false);
                    status.put("passwordLocation", "No email provided");
                }
                
                log.info("🔍 CountryCommitteeMemberService: Password status for member {}: {}", member.getName(), status);
                
            } else {
                status.put("error", "Member not found with ID: " + memberId);
            }
        } catch (Exception e) {
            log.error("❌ CountryCommitteeMemberService: Error checking password status for member ID: {}", memberId, e);
            status.put("error", "Error checking password status: " + e.getMessage());
        }
        
        return status;
    }
}