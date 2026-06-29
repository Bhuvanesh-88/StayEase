// dto/BookingResponseDto.java
package com.stayease.bookingservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponseDto {

    private Long bookingId;
    private Long roomId;
    private Long tenantId;
    private Long ownerId;
    private LocalDateTime requestedOn;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String notes;
    private LocalDateTime confirmedOn;
    private Double dailyRent;
    private Integer numberOfDays;
    private Double totalAmount;
    private LocalDateTime cancellationRequestedAt; // NEW
    private String cancellationReason; // NEW

    public BookingResponseDto() {
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public LocalDateTime getRequestedOn() { return requestedOn; }
    public void setRequestedOn(LocalDateTime requestedOn) { this.requestedOn = requestedOn; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getConfirmedOn() { return confirmedOn; }
    public void setConfirmedOn(LocalDateTime confirmedOn) { this.confirmedOn = confirmedOn; }

    public Double getDailyRent() { return dailyRent; }
    public void setDailyRent(Double dailyRent) { this.dailyRent = dailyRent; }

    public Integer getNumberOfDays() { return numberOfDays; }
    public void setNumberOfDays(Integer numberOfDays) { this.numberOfDays = numberOfDays; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCancellationRequestedAt() { return cancellationRequestedAt; }
    public void setCancellationRequestedAt(LocalDateTime cancellationRequestedAt) { this.cancellationRequestedAt = cancellationRequestedAt; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}