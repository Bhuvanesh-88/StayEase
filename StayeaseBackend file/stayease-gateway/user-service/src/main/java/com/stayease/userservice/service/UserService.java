package com.stayease.userservice.service;

import com.stayease.userservice.dto.AuthResponse;
import com.stayease.userservice.dto.LoginRequest;
import com.stayease.userservice.dto.RegisterRequest;
import com.stayease.userservice.dto.UserResponse;
import com.stayease.userservice.exception.EmailAlreadyExistsException;
import com.stayease.userservice.exception.InvalidCredentialsException;
import com.stayease.userservice.exception.UserNotFoundException;
import com.stayease.userservice.entity.Role;
import com.stayease.userservice.entity.User;
import com.stayease.userservice.repository.UserRepository;
import com.stayease.userservice.security.JwtUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse register(RegisterRequest request) {
        String name = StringUtils.trimToEmpty(request.getName());
        String email = StringUtils.trimToEmpty(request.getEmail()).toLowerCase();
        String password = StringUtils.trimToEmpty(request.getPassword());
        String phone = StringUtils.trimToEmpty(request.getPhone());
        String roleStr = StringUtils.trimToEmpty(request.getRole()).toUpperCase();

        // Better validation
        if (name.isEmpty()) throw new IllegalArgumentException("Name is required");
        if (email.isEmpty() || !email.contains("@")) throw new IllegalArgumentException("Valid email is required");
        if (password.isEmpty() || password.length() < 6) throw new IllegalArgumentException("Password must be at least 6 characters");
        if (phone.isEmpty()) throw new IllegalArgumentException("Phone is required");
        if (roleStr.isEmpty()) throw new IllegalArgumentException("Role is required");

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already registered: " + email);
        }

        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role. Use OWNER or TENANT only.");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setPhone(phone);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        if (email.isEmpty() || password.isEmpty()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
        if (!matches) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        return mapToUserResponse(user);
    }

    public UserResponse getUserByEmail(String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + normalizedEmail));

        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPhone(),
                user.getCreatedAt()
        );
    }
}
