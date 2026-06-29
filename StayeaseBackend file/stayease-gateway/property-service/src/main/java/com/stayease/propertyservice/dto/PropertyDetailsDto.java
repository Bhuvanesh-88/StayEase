package com.stayease.propertyservice.dto;

import java.util.List;

public class PropertyDetailsDto {

    private PropertyResponseDto property;
    private List<RoomResponseDto> rooms;

    public PropertyDetailsDto() {
    }

    public PropertyResponseDto getProperty() {
        return property;
    }

    public void setProperty(PropertyResponseDto property) {
        this.property = property;
    }

    public List<RoomResponseDto> getRooms() {
        return rooms;
    }

    public void setRooms(List<RoomResponseDto> rooms) {
        this.rooms = rooms;
    }
}