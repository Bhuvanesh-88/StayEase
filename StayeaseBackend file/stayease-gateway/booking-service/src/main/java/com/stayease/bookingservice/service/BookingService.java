package com.stayease.bookingservice.service;

import com.stayease.bookingservice.dto.BookingRequestDto;
import com.stayease.bookingservice.dto.BookingResponseDto;
import com.stayease.bookingservice.entity.AvailabilityLog;
import com.stayease.bookingservice.entity.AvailabilityReason;
import com.stayease.bookingservice.entity.Booking;
import com.stayease.bookingservice.entity.BookingStatus;
import com.stayease.bookingservice.exception.BadRequestException;
import com.stayease.bookingservice.exception.ResourceNotFoundException;
import com.stayease.bookingservice.repository.AvailabilityLogRepository;
import com.stayease.bookingservice.repository.BookingRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AvailabilityLogRepository availabilityLogRepository;
    private final RoomAvailabilityService roomAvailabilityService;
    private final BillingService billingService;

    public BookingService(
            BookingRepository bookingRepository,
            AvailabilityLogRepository availabilityLogRepository,
            RoomAvailabilityService roomAvailabilityService,
            BillingService billingService
    ) {
        this.bookingRepository = bookingRepository;
        this.availabilityLogRepository = availabilityLogRepository;
        this.roomAvailabilityService = roomAvailabilityService;
        this.billingService = billingService;
    }

    public BookingResponseDto createBooking(BookingRequestDto dto) {
        if (dto.getRoomId() == null || dto.getTenantId() == null || dto.getOwnerId() == null) {
            throw new BadRequestException("Room ID, Tenant ID, and Owner ID are required.");
        }

        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new BadRequestException("Start date and end date are required.");
        }

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        Booking booking = new Booking();
        booking.setRoomId(dto.getRoomId());
        booking.setTenantId(dto.getTenantId());
        booking.setOwnerId(dto.getOwnerId());
        booking.setRequestedOn(LocalDateTime.now());
        booking.setStartDate(dto.getStartDate());
        booking.setEndDate(dto.getEndDate());
        booking.setNotes(dto.getNotes());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public List<BookingResponseDto> getBookingsByTenant(Long tenantId) {
        List<Booking> bookings = bookingRepository.findByTenantId(tenantId);
        List<BookingResponseDto> response = new ArrayList<>();
        for (Booking booking : bookings) {
            response.add(mapToResponse(booking));
        }
        return response;
    }

    public List<BookingResponseDto> getBookingsByOwner(Long ownerId) {
        List<Booking> bookings = bookingRepository.findByOwnerId(ownerId);
        List<BookingResponseDto> response = new ArrayList<>();
        for (Booking booking : bookings) {
            response.add(mapToResponse(booking));
        }
        return response;
    }

    public BookingResponseDto updateBookingStatus(Long bookingId, String statusValue) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));

        // --- SECURITY CHECK START ---
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isTenant = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TENANT"));
        boolean isOwner = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));
        // --- SECURITY CHECK END ---

        BookingStatus oldStatus = booking.getStatus();
        BookingStatus newStatus;

        try {
            newStatus = BookingStatus.valueOf(statusValue.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid booking status: " + statusValue);
        }

        if (oldStatus == newStatus) {
            return mapToResponse(booking);
        }

        if (newStatus == BookingStatus.CONFIRMED) {
            // Only Owner can confirm
            if (!isOwner) {
                throw new BadRequestException("Only owners can confirm bookings.");
            }
            if (oldStatus != BookingStatus.PENDING) {
                throw new BadRequestException("Only pending bookings can be confirmed.");
            }

            roomAvailabilityService.decreaseAvailability(booking.getRoomId());

            AvailabilityLog log = new AvailabilityLog();
            log.setRoomId(booking.getRoomId());
            log.setChangeValue(-1);
            log.setReason(AvailabilityReason.BOOKED);
            log.setChangedAt(LocalDateTime.now());
            log.setChangedBy(booking.getOwnerId());
            availabilityLogRepository.save(log);

            booking.setConfirmedOn(LocalDateTime.now());
            booking.setStatus(BookingStatus.CONFIRMED);

        } else if (newStatus == BookingStatus.REJECTED) {
            // Only Owner can reject
            if (!isOwner) {
                throw new BadRequestException("Only owners can reject bookings.");
            }
            if (oldStatus != BookingStatus.PENDING) {
                throw new BadRequestException("Only pending bookings can be rejected.");
            }

            booking.setStatus(BookingStatus.REJECTED);

        } else if (newStatus == BookingStatus.CANCELLED) {
            // Only Tenant can cancel
            if (!isTenant) {
                throw new BadRequestException("Only tenants can cancel their own bookings.");
            }
            if (oldStatus != BookingStatus.PENDING) {
                throw new BadRequestException("Only pending bookings can be cancelled by tenant before confirmation.");
            }

            booking.setStatus(BookingStatus.CANCELLED);
        } else {
            throw new BadRequestException("Unsupported status transition to " + newStatus);
        }

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public BookingResponseDto getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));
        return mapToResponse(booking);
    }

    private BookingResponseDto mapToResponse(Booking booking) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setBookingId(booking.getBookingId());
        dto.setRoomId(booking.getRoomId());
        dto.setTenantId(booking.getTenantId());
        dto.setOwnerId(booking.getOwnerId());
        dto.setRequestedOn(booking.getRequestedOn());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setStatus(booking.getStatus().name());
        dto.setNotes(booking.getNotes());
        dto.setConfirmedOn(booking.getConfirmedOn());

        // Calculate billing
        try {
            BillingService.BillingDetails billing = billingService.calculateBilling(
                    booking.getRoomId(),
                    booking.getStartDate(),
                    booking.getEndDate()
            );
            dto.setDailyRent(billing.getDailyRent());
            dto.setNumberOfDays(billing.getNumberOfDays());
            dto.setTotalAmount(billing.getTotalAmount());
        } catch (Exception e) {
            // If billing calculation fails, set defaults
            dto.setDailyRent(0.0);
            dto.setNumberOfDays(0);
            dto.setTotalAmount(0.0);
        }

        return dto;
    }

    public BookingResponseDto requestCancellation(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));

        if (!booking.getStatus().equals(BookingStatus.PENDING) &&
                !booking.getStatus().equals(BookingStatus.CONFIRMED)) {
            throw new BadRequestException("Cancellation can only be requested for pending or confirmed bookings.");
        }

        booking.setCancellationRequestedAt(LocalDateTime.now());
        booking.setCancellationReason(reason);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public BookingResponseDto confirmCancellation(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));

        if (booking.getCancellationRequestedAt() == null) {
            throw new BadRequestException("No pending cancellation request for this booking.");
        }

        // If booking was confirmed, free up the room
        if (booking.getStatus().equals(BookingStatus.CONFIRMED)) {
            roomAvailabilityService.increaseAvailability(booking.getRoomId());

            AvailabilityLog log = new AvailabilityLog();
            log.setRoomId(booking.getRoomId());
            log.setChangeValue(1);
            log.setReason(AvailabilityReason.CANCELLED);
            log.setChangedAt(LocalDateTime.now());
            log.setChangedBy(booking.getOwnerId());
            availabilityLogRepository.save(log);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationRequestedAt(null);
        booking.setCancellationReason(null);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public BookingResponseDto rejectCancellation(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));

        if (booking.getCancellationRequestedAt() == null) {
            throw new BadRequestException("No pending cancellation request for this booking.");
        }

        booking.setCancellationRequestedAt(null);
        booking.setCancellationReason(null);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }
}