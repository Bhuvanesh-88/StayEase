package com.stayease.propertyservice.controller;

import com.stayease.propertyservice.dto.ApiResponse;
import com.stayease.propertyservice.dto.PropertyDetailsDto;
import com.stayease.propertyservice.dto.PropertyRequestDto;
import com.stayease.propertyservice.dto.PropertyResponseDto;
import com.stayease.propertyservice.service.PropertyService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ApiResponse<PropertyResponseDto> createProperty(@RequestBody PropertyRequestDto dto) {
        return new ApiResponse<>(true, "Property created successfully", propertyService.createProperty(dto));
    }

    @PutMapping("/{propertyId}")
    public ApiResponse<PropertyResponseDto> updateProperty(
            @PathVariable("propertyId") Long propertyId,
            @RequestBody PropertyRequestDto dto
    ) {
        return new ApiResponse<>(
                true,
                "Property updated successfully",
                propertyService.updateProperty(propertyId, dto)
        );
    }

    @DeleteMapping("/{propertyId}")
    public ApiResponse<String> deleteProperty(@PathVariable("propertyId") Long propertyId) throws IOException {
        propertyService.deleteProperty(propertyId);
        return new ApiResponse<>(true, "Property deleted successfully", "Deleted");
    }

    @GetMapping
    public ApiResponse<List<PropertyResponseDto>> getAllProperties() {
        return new ApiResponse<>(
                true,
                "Properties fetched successfully",
                propertyService.getAllProperties()
        );
    }

    @GetMapping("/owner/{ownerId}")
    public ApiResponse<List<PropertyResponseDto>> getPropertiesByOwner(@PathVariable("ownerId") Long ownerId) {
        return new ApiResponse<>(
                true,
                "Owner properties fetched successfully",
                propertyService.getPropertiesByOwner(ownerId)
        );
    }

    @GetMapping("/{propertyId}")
    public ApiResponse<PropertyDetailsDto> getPropertyDetails(@PathVariable("propertyId") Long propertyId) {
        return new ApiResponse<>(
                true,
                "Property details fetched successfully",
                propertyService.getPropertyDetails(propertyId)
        );
    }

    @GetMapping("/search")
    public ApiResponse<List<PropertyResponseDto>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent
    ) {
        return new ApiResponse<>(
                true,
                "Search results fetched successfully",
                propertyService.searchProperties(city, propertyType, minRent, maxRent)
        );
    }

    @PostMapping("/{propertyId}/images")
    public ApiResponse<PropertyResponseDto> uploadPropertyImage(
            @PathVariable("propertyId") Long propertyId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return new ApiResponse<>(
                true,
                "Image uploaded successfully",
                propertyService.uploadPropertyImage(propertyId, file)
        );
    }

    @DeleteMapping("/{propertyId}/images/{imageIndex}")
    public ApiResponse<PropertyResponseDto> deletePropertyImage(
            @PathVariable("propertyId") Long propertyId,
            @PathVariable("imageIndex") Integer imageIndex
    ) throws IOException {
        return new ApiResponse<>(
                true,
                "Image deleted successfully",
                propertyService.deletePropertyImage(propertyId, imageIndex)
        );
    }
}