package com.stayease.bookingservice.service;

import com.stayease.bookingservice.dto.OwnerDashboardDto;
import com.stayease.bookingservice.entity.BookingStatus;
import com.stayease.bookingservice.repository.BookingRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final BookingRepository bookingRepository;

    public DashboardService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public OwnerDashboardDto getOwnerDashboard(Long ownerId) {
        OwnerDashboardDto dto = new OwnerDashboardDto();
        dto.setOwnerId(ownerId);
        dto.setTotalBookings(bookingRepository.countByOwnerId(ownerId));
        dto.setPendingBookings(bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.PENDING));
        dto.setConfirmedBookings(bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.CONFIRMED));
        dto.setRejectedBookings(bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.REJECTED));
        dto.setCancelledBookings(bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.CANCELLED));
        return dto;
    }
}