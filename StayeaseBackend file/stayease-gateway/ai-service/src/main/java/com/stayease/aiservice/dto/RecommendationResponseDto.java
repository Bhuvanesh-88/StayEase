package com.stayease.aiservice.dto;

import java.util.List;

public class RecommendationResponseDto {

    private String summary;
    private List<RecommendationItemDto> recommendations;

    public RecommendationResponseDto() {
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<RecommendationItemDto> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendationItemDto> recommendations) {
        this.recommendations = recommendations;
    }
}