package com.earacg.earaconnect.controller;

import com.earacg.earaconnect.model.User;
import com.earacg.earaconnect.service.UserService;
import com.earacg.earaconnect.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            if (authentication != null && authentication.isAuthenticated()) {
            
            // Preserve original side effects on successful login
            userService.recordSuccessfulLogin(email);
            
            // Persist authentication in session for subsequent requests
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            request.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
            if (request.getSession(false) == null) {
                request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
            }

            User user = userService.getUserByEmail(email).orElse(null);
            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", user);
                return ResponseEntity.ok(response);
            }
            }
        } catch (Exception ex) {
            // fall through to error response
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
        } catch (Exception ignored) {}
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam String email, @RequestBody User userDetails) {
        User existingUser = userService.getUserByEmail(email).orElse(null);
        if (existingUser != null) {
            User updatedUser = userService.updateUser(existingUser.getId(), userDetails);
            if (updatedUser != null) {
                return ResponseEntity.ok(updatedUser);
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Failed to update profile"));
    }
    
    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            String password = request.get("password");
            
            if (email == null || name == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email, name, and password are required"));
            }
            
            emailService.sendCredentials(email, name, password);
            return ResponseEntity.ok(Map.of("message", "Test email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to send test email: " + e.getMessage()));
        }
    }
    

} 