package com.stayease.userservice.controller;

import com.stayease.userservice.dto.UserResponse;
import com.stayease.userservice.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable("id") Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/email")
    public UserResponse getUserByEmail(@RequestParam("value") String email) {
        return userService.getUserByEmail(email);
    }
}