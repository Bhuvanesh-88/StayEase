package com.stayease.propertyservice.service;

import com.stayease.propertyservice.dto.OwnerPropertyDashboardDto;
import com.stayease.propertyservice.entity.Property;
import com.stayease.propertyservice.entity.Room;
import com.stayease.propertyservice.repository.PropertyRepository;
import com.stayease.propertyservice.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OwnerPropertyDashboardService {

    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;

    public OwnerPropertyDashboardService(PropertyRepository propertyRepository, RoomRepository roomRepository) {
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
    }

    public OwnerPropertyDashboardDto getOwnerPropertyDashboard(Long ownerId) {
        List<Property> properties = propertyRepository.findByOwnerId(ownerId);
        List<Long> propertyIds = new ArrayList<>();

        long totalRooms = 0;
        long totalAvailableRooms = 0;

        for (Property property : properties) {
            propertyIds.add(property.getPropertyId());
            List<Room> rooms = roomRepository.findByPropertyId(property.getPropertyId());
            for (Room room : rooms) {
                totalRooms += room.getTotalCount();
                totalAvailableRooms += room.getAvailableCount();
            }
        }

        OwnerPropertyDashboardDto dto = new OwnerPropertyDashboardDto();
        dto.setOwnerId(ownerId);
        dto.setTotalProperties(properties.size());
        dto.setTotalRooms(totalRooms);
        dto.setAvailableRooms(totalAvailableRooms);

        return dto;
    }
}