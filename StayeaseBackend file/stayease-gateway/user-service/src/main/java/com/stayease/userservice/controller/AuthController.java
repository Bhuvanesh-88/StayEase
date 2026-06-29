package com.stayease.userservice.controller;

import com.stayease.userservice.dto.AuthResponse;
import com.stayease.userservice.dto.RegisterRequest;
import com.stayease.userservice.dto.LoginRequest;
import com.stayease.userservice.dto.UserResponse;
import com.stayease.userservice.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }
}