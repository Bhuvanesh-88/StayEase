package com.stayease.aiservice.service;

import com.stayease.aiservice.dto.PropertySummaryRequest;
import com.stayease.aiservice.dto.RecommendationItemDto;
import com.stayease.aiservice.dto.RecommendationResponseDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiService {

    public String summarizeProperty(PropertySummaryRequest request) {
        StringBuilder summary = new StringBuilder();

        summary.append(request.getTitle())
                .append(" is a ")
                .append(safe(request.getPropertyType()).toLowerCase())
                .append(" stay option in ")
                .append(safe(request.getCity()))
                .append(", ")
                .append(safe(request.getState()));

        if (request.getMonthlyRent() != null) {
            summary.append(" with monthly rent around ₹").append(request.getMonthlyRent().intValue());
        }

        if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
            summary.append(". Key amenities include ")
                    .append(String.join(", ", request.getAmenities())); // Join the list with commas
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            summary.append(". ").append(request.getDescription());
        }

        return summary.toString();
    }

    public RecommendationResponseDto buildRecommendations(List<RecommendationItemDto> items, String city, String propertyType) {
        RecommendationResponseDto response = new RecommendationResponseDto();
        response.setSummary("Recommended stays based on your preferred city, budget range, and accommodation type.");

        for (RecommendationItemDto item : items) {
            String reason = "Matches your search";
            if (city != null && city.equalsIgnoreCase(item.getCity())) {
                reason = "Recommended because it is in your preferred city";
            }
            if (propertyType != null && propertyType.equalsIgnoreCase(item.getPropertyType())) {
                reason = reason + " and matches your preferred property type";
            }
            item.setReason(reason);
        }

        response.setRecommendations(items);
        return response;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}