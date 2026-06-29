package com.stayease.bookingservice.dto;

public class BookingStatusUpdateRequest {

    private String status;

    public BookingStatusUpdateRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}