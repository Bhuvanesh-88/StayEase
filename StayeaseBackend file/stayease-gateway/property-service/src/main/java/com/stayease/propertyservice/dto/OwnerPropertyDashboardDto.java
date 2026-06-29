package com.stayease.propertyservice.dto;

public class OwnerPropertyDashboardDto {

    private Long ownerId;
    private long totalProperties;
    private long totalRooms;
    private long availableRooms;

    public OwnerPropertyDashboardDto() {
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public long getTotalProperties() {
        return totalProperties;
    }

    public void setTotalProperties(long totalProperties) {
        this.totalProperties = totalProperties;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(long totalAvailableRooms) {
        this.availableRooms = totalAvailableRooms;
    }
}