// controller/BookingController.java
package com.stayease.bookingservice.controller;

import com.stayease.bookingservice.dto.BookingRequestDto;
import com.stayease.bookingservice.dto.BookingResponseDto;
import com.stayease.bookingservice.dto.BookingStatusUpdateRequest;
import com.stayease.bookingservice.dto.CancellationRequestDto;
import com.stayease.bookingservice.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponseDto createBooking(@RequestBody BookingRequestDto requestDto) {
        return bookingService.createBooking(requestDto);
    }

    @GetMapping("/{bookingId}")
    public BookingResponseDto getBookingById(@PathVariable("bookingId") Long bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @GetMapping("/tenant/{tenantId}")
    public List<BookingResponseDto> getBookingsByTenant(@PathVariable("tenantId") Long tenantId) {
        return bookingService.getBookingsByTenant(tenantId);
    }

    @GetMapping("/owner/{ownerId}")
    public List<BookingResponseDto> getBookingsByOwner(@PathVariable("ownerId") Long ownerId) {
        return bookingService.getBookingsByOwner(ownerId);
    }

    @PatchMapping("/{bookingId}/status")
    public BookingResponseDto updateBookingStatus(
            @PathVariable("bookingId") Long bookingId,
            @RequestBody BookingStatusUpdateRequest request
    ) {
        return bookingService.updateBookingStatus(bookingId, request.getStatus());
    }

    // NEW: Request cancellation
    @PatchMapping("/{bookingId}/request-cancellation")
    public BookingResponseDto requestCancellation(
            @PathVariable("bookingId") Long bookingId,
            @RequestBody CancellationRequestDto request
    ) {
        return bookingService.requestCancellation(bookingId, request.getReason());
    }

    // NEW: Confirm cancellation
    @PatchMapping("/{bookingId}/confirm-cancellation")
    public BookingResponseDto confirmCancellation(
            @PathVariable("bookingId") Long bookingId
    ) {
        return bookingService.confirmCancellation(bookingId);
    }

    // NEW: Reject cancellation
    @PatchMapping("/{bookingId}/reject-cancellation")
    public BookingResponseDto rejectCancellation(
            @PathVariable("bookingId") Long bookingId
    ) {
        return bookingService.rejectCancellation(bookingId);
    }
}