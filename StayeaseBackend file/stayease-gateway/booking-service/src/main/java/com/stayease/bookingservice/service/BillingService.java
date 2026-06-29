package com.stayease.bookingservice.service;

import com.stayease.bookingservice.client.PropertyServiceClient;
import com.stayease.bookingservice.dto.RoomResponseDto;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class BillingService {

    private final PropertyServiceClient propertyServiceClient;

    public BillingService(PropertyServiceClient propertyServiceClient) {
        this.propertyServiceClient = propertyServiceClient;
    }

    public BillingDetails calculateBilling(Long roomId, LocalDate startDate, LocalDate endDate) {
        try {
            RoomResponseDto room = getRoomDetails(roomId);

            Integer numberOfDays = (int) ChronoUnit.DAYS.between(startDate, endDate);
            if (numberOfDays <= 0) {
                numberOfDays = 1;
            }

            Double dailyRent = room.getRent();
            Double totalAmount = dailyRent * numberOfDays;

            return new BillingDetails(dailyRent, numberOfDays, totalAmount);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate billing: " + e.getMessage());
        }
    }

    private RoomResponseDto getRoomDetails(Long roomId) {
        return propertyServiceClient.getRoomById(roomId).getData();
    }

    public static class BillingDetails {
        public Double dailyRent;
        public Integer numberOfDays;
        public Double totalAmount;

        public BillingDetails(Double dailyRent, Integer numberOfDays, Double totalAmount) {
            this.dailyRent = dailyRent;
            this.numberOfDays = numberOfDays;
            this.totalAmount = totalAmount;
        }

        public Double getDailyRent() {
            return dailyRent;
        }

        public Integer getNumberOfDays() {
            return numberOfDays;
        }

        public Double getTotalAmount() {
            return totalAmount;
        }
    }
}