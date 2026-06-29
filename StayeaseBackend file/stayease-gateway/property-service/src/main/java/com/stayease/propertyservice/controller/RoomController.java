// controller/RoomController.java
package com.stayease.propertyservice.controller;

import com.stayease.propertyservice.dto.ApiResponse;
import com.stayease.propertyservice.dto.RoomRequestDto;
import com.stayease.propertyservice.dto.RoomResponseDto;
import com.stayease.propertyservice.service.RoomService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ApiResponse<RoomResponseDto> addRoom(@RequestBody RoomRequestDto dto) {
        RoomResponseDto room = roomService.addRoom(dto);
        return new ApiResponse<>(true, "Room added successfully", room);
    }

    @PutMapping("/{roomId}")
    public ApiResponse<RoomResponseDto> updateRoom(
            @PathVariable("roomId") Long roomId,
            @RequestBody RoomRequestDto dto) {
        RoomResponseDto room = roomService.updateRoom(roomId, dto);
        return new ApiResponse<>(true, "Room updated successfully", room);
    }

    @DeleteMapping("/{roomId}")
    public ApiResponse<String> deleteRoom(@PathVariable("roomId") Long roomId) {
        roomService.deleteRoom(roomId);
        return new ApiResponse<>(true, "Room deleted successfully", "Deleted");
    }

    @GetMapping("/{roomId}")
    public ApiResponse<RoomResponseDto> getRoomById(@PathVariable("roomId") Long roomId) {
        RoomResponseDto room = roomService.getRoomById(roomId);
        return new ApiResponse<>(true, "Room fetched successfully", room);
    }

    @GetMapping("/property/{propertyId}")
    public ApiResponse<List<RoomResponseDto>> getRoomsByPropertyId(@PathVariable("propertyId") Long propertyId) {
        List<RoomResponseDto> rooms = roomService.getRoomsByPropertyId(propertyId);
        return new ApiResponse<>(true, "Rooms fetched successfully", rooms);
    }

    // CHANGE THIS LINE:
    @PutMapping("/{roomId}/availability")
    public ApiResponse<RoomResponseDto> updateAvailability(
            @PathVariable("roomId") Long roomId,
            @RequestParam("availableCount") Integer availableCount) {
        RoomResponseDto room = roomService.updateRoomAvailability(roomId, availableCount);
        return new ApiResponse<>(true, "Room availability updated successfully", room);
    }

}