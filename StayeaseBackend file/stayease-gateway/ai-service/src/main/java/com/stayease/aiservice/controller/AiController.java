package com.stayease.aiservice.controller;

import com.stayease.aiservice.dto.PropertySummaryRequest;
import com.stayease.aiservice.dto.RecommendationItemDto;
import com.stayease.aiservice.dto.RecommendationResponseDto;
import com.stayease.aiservice.service.AiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/summarize")
    public String summarize(@RequestBody PropertySummaryRequest request) {
        return aiService.summarizeProperty(request);
    }

    @PostMapping("/recommendations")
    public RecommendationResponseDto recommend(@RequestParam(required = false) String city,
                                               @RequestParam(required = false) String propertyType,
                                               @RequestBody List<RecommendationItemDto> items) {
        return aiService.buildRecommendations(items, city, propertyType);
    }
}