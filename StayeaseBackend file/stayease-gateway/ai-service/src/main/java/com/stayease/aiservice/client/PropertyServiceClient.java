package com.stayease.aiservice.client;

import com.stayease.aiservice.dto.ApiResponse;
import com.stayease.aiservice.dto.PropertyResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
        name = "property-service-client",
        url = "${services.property-service.url}"
)
public interface PropertyServiceClient {

    @GetMapping("/api/properties/search")
    ApiResponse<List<PropertyResponseDto>> searchProperties(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "propertyType", required = false) String propertyType,
            @RequestParam(value = "minRent", required = false) Double minRent,
            @RequestParam(value = "maxRent", required = false) Double maxRent
    );
}