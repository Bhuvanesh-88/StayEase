package com.stayease.propertyservice.controller;

import com.stayease.propertyservice.dto.ApiResponse;
import com.stayease.propertyservice.dto.OwnerPropertyDashboardDto;
import com.stayease.propertyservice.service.OwnerPropertyDashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/property-dashboard")
public class OwnerPropertyDashboardController {

    private final OwnerPropertyDashboardService dashboardService;

    public OwnerPropertyDashboardController(OwnerPropertyDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/owner/{ownerId}")
    public ApiResponse<OwnerPropertyDashboardDto> getOwnerDashboard(@PathVariable("ownerId") Long ownerId) {
        return new ApiResponse<>(
                true,
                "Owner property dashboard fetched successfully",
                dashboardService.getOwnerPropertyDashboard(ownerId)
        );
    }
}