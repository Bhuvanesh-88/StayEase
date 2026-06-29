package com.stayease.bookingservice.controller;

import com.stayease.bookingservice.dto.OwnerDashboardDto;
import com.stayease.bookingservice.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/owner/{ownerId}")
    public OwnerDashboardDto getOwnerDashboard(@PathVariable("ownerId") Long ownerId) {
        return dashboardService.getOwnerDashboard(ownerId);
    }
}