// service/RoomService.java
package com.stayease.propertyservice.service;

import com.stayease.propertyservice.dto.RoomRequestDto;
import com.stayease.propertyservice.dto.RoomResponseDto;
import com.stayease.propertyservice.entity.Property;
import com.stayease.propertyservice.entity.Room;
import com.stayease.propertyservice.entity.RoomType;
import com.stayease.propertyservice.exception.BadRequestException;
import com.stayease.propertyservice.exception.ResourceNotFoundException;
import com.stayease.propertyservice.repository.PropertyRepository;
import com.stayease.propertyservice.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    public RoomService(RoomRepository roomRepository, PropertyRepository propertyRepository) {
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
    }

    public RoomResponseDto addRoom(RoomRequestDto dto) {
        validateRoomDto(dto);

        // Verify property exists
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id " + dto.getPropertyId()));

        Room room = new Room();
        room.setPropertyId(dto.getPropertyId());
        room.setRoomType(parseRoomType(dto.getRoomType()));
        room.setRent(dto.getRent());
        room.setTotalCount(dto.getTotalCount());
        // Automatically set available count equal to total count when creating
        room.setAvailableCount(dto.getTotalCount());
        room.setDescription(dto.getDescription());

        Room savedRoom = roomRepository.save(room);
        return mapToResponse(savedRoom);
    }

    public RoomResponseDto updateRoom(Long roomId, RoomRequestDto dto) {
        validateRoomDto(dto);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        // Verify property exists
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id " + dto.getPropertyId()));

        room.setPropertyId(property.getPropertyId());
        room.setRoomType(parseRoomType(dto.getRoomType()));
        room.setRent(dto.getRent());
        room.setTotalCount(dto.getTotalCount());

        // Ensure available count doesn't exceed total count
        if (dto.getAvailableCount() > dto.getTotalCount()) {
            room.setAvailableCount(dto.getTotalCount());
        } else {
            room.setAvailableCount(dto.getAvailableCount());
        }

        room.setDescription(dto.getDescription());

        Room updatedRoom = roomRepository.save(room);
        return mapToResponse(updatedRoom);
    }

    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        roomRepository.delete(room);
    }

    public RoomResponseDto getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        return mapToResponse(room);
    }

    public List<RoomResponseDto> getRoomsByPropertyId(Long propertyId) {
        // Verify property exists
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with id " + propertyId);
        }

        List<Room> rooms = roomRepository.findByPropertyId(propertyId);

        return rooms.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RoomResponseDto updateRoomAvailability(Long roomId, Integer availableCount) {
        if (availableCount == null || availableCount < 0) {
            throw new BadRequestException("Available count must be valid.");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        if (availableCount > room.getTotalCount()) {
            throw new BadRequestException("Available count cannot exceed total count.");
        }

        room.setAvailableCount(availableCount);
        Room updatedRoom = roomRepository.save(room);
        return mapToResponse(updatedRoom);
    }

    private void validateRoomDto(RoomRequestDto dto) {
        if (dto.getPropertyId() == null) {
            throw new BadRequestException("Property ID is required.");
        }
        if (dto.getRoomType() == null || dto.getRoomType().isBlank()) {
            throw new BadRequestException("Room type is required.");
        }
        if (dto.getRent() == null || dto.getRent() <= 0) {
            throw new BadRequestException("Rent must be greater than 0.");
        }
        if (dto.getTotalCount() == null || dto.getTotalCount() < 1) {
            throw new BadRequestException("Total count must be at least 1.");
        }
        if (dto.getAvailableCount() != null && dto.getAvailableCount() < 0) {
            throw new BadRequestException("Available count must be valid.");
        }
        if (dto.getAvailableCount() != null && dto.getAvailableCount() > dto.getTotalCount()) {
            throw new BadRequestException("Available count cannot exceed total count.");
        }
    }

    private RoomType parseRoomType(String roomType) {
        try {
            return RoomType.valueOf(roomType.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid room type: " + roomType);
        }
    }

    private RoomResponseDto mapToResponse(Room room) {
        RoomResponseDto dto = new RoomResponseDto();
        dto.setRoomId(room.getRoomId());
        dto.setPropertyId(room.getPropertyId());
        dto.setRoomType(room.getRoomType().name());
        dto.setRent(room.getRent());
        dto.setTotalCount(room.getTotalCount());
        dto.setAvailableCount(room.getAvailableCount());
        dto.setDescription(room.getDescription());
        return dto;
    }
}