package com.stayease.bookingservice.repository;

import com.stayease.bookingservice.entity.AvailabilityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvailabilityLogRepository extends JpaRepository<AvailabilityLog, Long> {

    List<AvailabilityLog> findByRoomId(Long roomId);
}