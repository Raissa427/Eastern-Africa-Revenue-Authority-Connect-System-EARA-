package com.earacg.earaconnect.service;

import com.earacg.earaconnect.model.User;
import com.earacg.earaconnect.model.SubCommittee;
import com.earacg.earaconnect.repository.UserRepo;
import com.earacg.earaconnect.repository.SubCommitteeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

/**
 * Service to handle HOD (Head of Delegation) permissions
 * Treats the Chair of "Head Of Delegation" subcommittee as having HOD privileges
 */
@Service
public class HODPermissionService {

    private static final Logger logger = LoggerFactory.getLogger(HODPermissionService.class);
    
    private static final String HEAD_OF_DELEGATION_SUBCOMMITTEE_NAME = "Head Of Delegation";

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private SubCommitteeRepo subCommitteeRepo;

    /**
     * Check if a user has HOD privileges
     * This includes ONLY:
     * 1. Users with role CHAIR who are chair of "Head Of Delegation" subcommittee
     * 2. Users with role VICE_CHAIR who are vice chair of "Head Of Delegation" subcommittee
     * 
     * Note: There is no direct HOD role in this system
     */
    public boolean hasHODPrivileges(Long userId) {
        try {
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isEmpty()) {
                logger.warn("User with ID {} not found", userId);
                return false;
            }

            User user = userOpt.get();
            return hasHODPrivileges(user);
        } catch (Exception e) {
            logger.error("Error checking HOD privileges for user ID {}: {}", userId, e.getMessage());
            return false;
        }
    }

    /**
     * Check if a user has HOD privileges (overloaded method with User object)
     */
    public boolean hasHODPrivileges(User user) {
        if (user == null) {
            return false;
        }

        try {
            // Only Chair or Vice Chair of Head Of Delegation subcommittee have HOD privileges
            // There is no direct HOD role in this system
            if (User.UserRole.CHAIR.equals(user.getRole()) || User.UserRole.VICE_CHAIR.equals(user.getRole())) {
                return isChairOfHeadOfDelegation(user);
            }

            return false;
        } catch (Exception e) {
            logger.error("Error checking HOD privileges for user {}: {}", user.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * Check if user is Chair/Vice Chair of Head Of Delegation subcommittee
     */
    private boolean isChairOfHeadOfDelegation(User user) {
        try {
            if (user.getSubcommittee() == null) {
                logger.debug("User {} has no subcommittee assigned", user.getId());
                return false;
            }

            SubCommittee subcommittee = user.getSubcommittee();
            boolean isHeadOfDelegation = HEAD_OF_DELEGATION_SUBCOMMITTEE_NAME.equals(subcommittee.getName());
            
            if (isHeadOfDelegation) {
                logger.info("User {} is Chair/Vice Chair of Head Of Delegation subcommittee - granting HOD privileges", user.getId());
            }

            return isHeadOfDelegation;
        } catch (Exception e) {
            logger.error("Error checking if user {} is Chair of Head Of Delegation: {}", user.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * Get the Head Of Delegation subcommittee ID
     */
    public Long getHeadOfDelegationSubcommitteeId() {
        try {
            Optional<SubCommittee> hodSubcommittee = subCommitteeRepo.findByName(HEAD_OF_DELEGATION_SUBCOMMITTEE_NAME);
            if (hodSubcommittee.isPresent()) {
                return hodSubcommittee.get().getId();
            }
            logger.warn("Head Of Delegation subcommittee not found");
            return null;
        } catch (Exception e) {
            logger.error("Error getting Head Of Delegation subcommittee ID: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if a subcommittee is the Head Of Delegation subcommittee
     */
    public boolean isHeadOfDelegationSubcommittee(Long subcommitteeId) {
        try {
            Optional<SubCommittee> subcommitteeOpt = subCommitteeRepo.findById(subcommitteeId);
            if (subcommitteeOpt.isEmpty()) {
                return false;
            }
            return HEAD_OF_DELEGATION_SUBCOMMITTEE_NAME.equals(subcommitteeOpt.get().getName());
        } catch (Exception e) {
            logger.error("Error checking if subcommittee {} is Head Of Delegation: {}", subcommitteeId, e.getMessage());
            return false;
        }
    }

    /**
     * Get user role display name considering HOD privileges
     */
    public String getUserRoleDisplay(User user) {
        if (hasHODPrivileges(user)) {
            // Only Chair/Vice Chair of Head of Delegation can have HOD privileges
            return "Head of Delegation";
        }
        return user.getRole().toString();
    }
}
