package com.stayease.propertyservice.repository;

import com.stayease.propertyservice.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByPropertyId(Long propertyId);

    long countByPropertyIdIn(List<Long> propertyIds);
}