package com.stayease.bookingservice.service;

import com.stayease.bookingservice.client.PropertyServiceClient;
import com.stayease.bookingservice.dto.ApiResponse;
import com.stayease.bookingservice.dto.RoomResponseDto;
import com.stayease.bookingservice.exception.BadRequestException;
import org.springframework.stereotype.Service;

@Service
public class RoomAvailabilityService {

    private final PropertyServiceClient propertyServiceClient;

    public RoomAvailabilityService(PropertyServiceClient propertyServiceClient) {
        this.propertyServiceClient = propertyServiceClient;
    }

    public RoomResponseDto getRoomById(Long roomId) {
        ApiResponse<RoomResponseDto> response = propertyServiceClient.getRoomById(roomId);

        if (response == null || response.getData() == null) {
            throw new BadRequestException("Unable to fetch room details for room ID " + roomId);
        }

        return response.getData();
    }

    public void updateRoomAvailability(Long roomId, int availableCount) {
        ApiResponse<RoomResponseDto> response = propertyServiceClient.updateRoomAvailability(roomId, availableCount);

        if (response == null || response.getData() == null) {
            throw new BadRequestException("Unable to update room availability for room ID " + roomId);
        }
    }

    public void decreaseAvailability(Long roomId) {
        RoomResponseDto room = getRoomById(roomId);

        if (room.getAvailableCount() == null || room.getAvailableCount() <= 0) {
            throw new BadRequestException("No rooms available for booking.");
        }

        updateRoomAvailability(roomId, room.getAvailableCount() - 1);
    }

    public void increaseAvailability(Long roomId) {
        RoomResponseDto room = getRoomById(roomId);

        int current = room.getAvailableCount() == null ? 0 : room.getAvailableCount();
        int total = room.getTotalCount() == null ? 0 : room.getTotalCount();

        if (current >= total) {
            throw new BadRequestException("Room availability cannot exceed total room count.");
        }

        updateRoomAvailability(roomId, current + 1);
    }
}