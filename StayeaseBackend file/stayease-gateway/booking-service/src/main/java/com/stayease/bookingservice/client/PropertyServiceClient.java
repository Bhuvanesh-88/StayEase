package com.stayease.bookingservice.client;

import com.stayease.bookingservice.config.FeignClientConfig;
import com.stayease.bookingservice.dto.ApiResponse;
import com.stayease.bookingservice.dto.RoomResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "property-service-client",
        url = "${services.property-service.url}",
        configuration = FeignClientConfig.class // Add this line
)
public interface PropertyServiceClient {

    @GetMapping("/api/rooms/{roomId}")
    ApiResponse<RoomResponseDto> getRoomById(@PathVariable("roomId") Long roomId);

    @PutMapping("/api/rooms/{roomId}/availability")
    ApiResponse<RoomResponseDto> updateRoomAvailability(
            @PathVariable("roomId") Long roomId,
            @RequestParam("availableCount") Integer availableCount
    );
}