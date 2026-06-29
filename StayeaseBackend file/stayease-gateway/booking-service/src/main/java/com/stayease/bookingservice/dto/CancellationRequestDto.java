// dto/CancellationRequestDto.java
package com.stayease.bookingservice.dto;

public class CancellationRequestDto {
    private String reason;

    public CancellationRequestDto() {
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}