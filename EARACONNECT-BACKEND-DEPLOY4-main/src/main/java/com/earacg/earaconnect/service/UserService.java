package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.User;
import com.earacg.earaconnect.model.Country;
import com.earacg.earaconnect.model.SubCommittee;
import com.earacg.earaconnect.repository.UserRepo;
import com.earacg.earaconnect.service.CountryService;
import com.earacg.earaconnect.service.SubCommitteeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    
    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private CountryService countryService;
    
    @Autowired
    private SubCommitteeService subCommitteeService;
    
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepo.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepo.findByEmail(email);
    }
    
    public List<User> getUsersByRole(User.UserRole role) {
        return userRepo.findByRole(role);
    }
    
    public List<User> getUsersByCountry(Long countryId) {
        return userRepo.findByCountryId(countryId);
    }
    
    public User createUser(User user) {
        // Resolve country and subcommittee references if they have only ID
        resolveEntityReferences(user);
        
        // Validate role-specific requirements
        validateUserRoleRequirements(user);
        
        // Check if user already exists
        Optional<User> existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            // Update existing user instead of creating new one
            User existing = existingUser.get();
            existing.setName(user.getName());
            existing.setPhone(user.getPhone());
            existing.setRole(user.getRole());
            existing.setCountry(user.getCountry());
            existing.setSubcommittee(user.getSubcommittee());
            existing.setActive(true);
            
            // Generate new password and send credentials
            String randomPassword = generateRandomPassword();
            existing.setPassword(randomPassword);
            
            User savedUser = userRepo.save(existing);
            
            // Send credentials via email
            emailService.sendCredentials(user.getEmail(), user.getName(), randomPassword);
            
            return savedUser;
        }
        
        // Generate random password for new users
        String randomPassword = generateRandomPassword();
        user.setPassword(randomPassword);
        
        User savedUser = userRepo.save(user);
        
        // Send credentials via email
        emailService.sendCredentials(user.getEmail(), user.getName(), randomPassword);
        
        return savedUser;
    }
    
    public User updateUser(Long id, User userDetails) {
        // Resolve country and subcommittee references if they have only ID
        resolveEntityReferences(userDetails);
        
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setName(userDetails.getName());
            user.setPhone(userDetails.getPhone());
            user.setEmail(userDetails.getEmail());
            
            // Update additional fields if provided
            if (userDetails.getAddress() != null) {
                user.setAddress(userDetails.getAddress());
            }
            if (userDetails.getDepartment() != null) {
                user.setDepartment(userDetails.getDepartment());
            }
            if (userDetails.getPosition() != null) {
                user.setPosition(userDetails.getPosition());
            }
            if (userDetails.getCountry() != null) {
                user.setCountry(userDetails.getCountry());
            }
            if (userDetails.getSubcommittee() != null) {
                user.setSubcommittee(userDetails.getSubcommittee());
            }
            
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(userDetails.getPassword());
            }
            return userRepo.save(user);
        }
        return null;
    }
    
    public boolean deleteUser(Long id) {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id);
            return true;
        }
        return false;
    }
    
    public boolean authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean passwordMatch = user.getPassword().equals(password);
            boolean isActive = user.isActive();
            
            if (passwordMatch && isActive) {
                // Update last login and first login flag
                user.setLastLogin(java.time.LocalDateTime.now());
                if (user.getFirstLogin() == null || user.getFirstLogin()) {
                    user.setFirstLogin(false);
                }
                userRepo.save(user);
                return true;
            }
        }
        return false;
    }

    /**
     * Apply login side effects after a successful authentication
     * without performing password verification here.
     */
    public void recordSuccessfulLogin(String email) {
        userRepo.findByEmail(email).ifPresent(user -> {
            user.setLastLogin(java.time.LocalDateTime.now());
            if (user.getFirstLogin() == null || user.getFirstLogin()) {
                user.setFirstLogin(false);
            }
            userRepo.save(user);
        });
    }
    
    public User getAdminUser() {
        List<User> admins = userRepo.findByRole(User.UserRole.ADMIN);
        if (!admins.isEmpty()) {
            return admins.get(0);
        }
        return null;
    }
    
    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * Resend credentials to an existing user with a new password
     */
    public User resendCredentials(Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Generate new password
            String newPassword = generateRandomPassword();
            user.setPassword(newPassword);
            
            // Save user with new password
            User savedUser = userRepo.save(user);
            
            // Send credentials via email
            emailService.sendCredentials(user.getEmail(), user.getName(), newPassword);
            
            return savedUser;
        }
        throw new IllegalArgumentException("User not found with ID: " + userId);
    }
    
    /**
     * Validate role-specific requirements for users
     */
    private void validateUserRoleRequirements(User user) {
        if (user.getRole() == null) {
            throw new IllegalArgumentException("User role is required");
        }
        
        // Secretary role requires country_id
        if (user.getRole() == User.UserRole.SECRETARY && user.getCountry() == null) {
            throw new IllegalArgumentException("Country is required for SECRETARY role");
        }
        
        // Chair and Subcommittee Member roles require subcommittee_id
        if ((user.getRole() == User.UserRole.CHAIR || user.getRole() == User.UserRole.SUBCOMMITTEE_MEMBER) 
            && user.getSubcommittee() == null) {
            throw new IllegalArgumentException("Subcommittee is required for CHAIR and SUBCOMMITTEE_MEMBER roles");
        }
        
        // Committee Secretary requires country_id (location-restricted)
        if (user.getRole() == User.UserRole.COMMITTEE_SECRETARY && user.getCountry() == null) {
            throw new IllegalArgumentException("Country is required for COMMITTEE_SECRETARY role");
        }
        
        // Delegation Secretary requires country_id
        if (user.getRole() == User.UserRole.DELEGATION_SECRETARY && user.getCountry() == null) {
            throw new IllegalArgumentException("Country is required for DELEGATION_SECRETARY role");
        }
    }
    
    /**
     * Resolve entity references by fetching full objects from database when only ID is provided
     */
    private void resolveEntityReferences(User user) {
        // Resolve country reference if only ID is provided
        if (user.getCountry() != null && user.getCountry().getId() != null) {
            try {
                Country fullCountry = countryService.getCountryById(user.getCountry().getId());
                user.setCountry(fullCountry);
            } catch (Exception e) {
                throw new IllegalArgumentException("Country not found with ID: " + user.getCountry().getId());
            }
        }
        
        // Resolve subcommittee reference if only ID is provided
        if (user.getSubcommittee() != null && user.getSubcommittee().getId() != null) {
            SubCommittee fullSubcommittee = subCommitteeService.getSubCommitteeById(user.getSubcommittee().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Subcommittee not found with ID: " + user.getSubcommittee().getId()));
            user.setSubcommittee(fullSubcommittee);
        }
    }

    /**
     * Change user password
     * @param userId User ID
     * @param currentPassword Current password for verification
     * @param newPassword New password to set
     * @return true if password changed successfully, false if current password is incorrect
     */
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Verify current password
            if (user.getPassword().equals(currentPassword)) {
                // Set new password
                user.setPassword(newPassword);
                
                // Update password changed timestamp if the field exists
                try {
                    // Try to set passwordChangedAt if the field exists in the User model
                    user.getClass().getMethod("setPasswordChangedAt", java.time.LocalDateTime.class)
                        .invoke(user, java.time.LocalDateTime.now());
                } catch (Exception e) {
                    // Field doesn't exist, ignore
                    System.out.println("Password changed timestamp field not available");
                }
                
                userRepo.save(user);
                return true;
            }
        }
        return false;
    }
} 