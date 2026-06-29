// api/bookingApi.ts
import axiosClient from "./axiosClient";
import type { Booking, BookingStatus } from "../types/models";

export const createBooking = async (payload: {
  roomId: number;
  tenantId: number;
  ownerId: number;
  startDate: string;
  endDate: string;
  notes?: string;
}): Promise<Booking> => {
  const response = await axiosClient.post("/bookings", payload);
  return response.data;
};

export const getBookingById = async (bookingId: number): Promise<Booking> => {
  const response = await axiosClient.get(`/bookings/${bookingId}`);
  return response.data;
};

export const getTenantBookings = async (tenantId: number): Promise<Booking[]> => {
  const response = await axiosClient.get(`/bookings/tenant/${tenantId}`);
  return response.data;
};

export const getOwnerBookings = async (ownerId: number): Promise<Booking[]> => {
  const response = await axiosClient.get(`/bookings/owner/${ownerId}`);
  return response.data;
};

export const updateBookingStatus = async (
  bookingId: number,
  status: BookingStatus
): Promise<Booking> => {
  const response = await axiosClient.patch(`/bookings/${bookingId}/status`, {
    status,
  });
  return response.data;
};

export const requestBookingCancellation = async (
  bookingId: number,
  reason: string
): Promise<Booking> => {
  const response = await axiosClient.patch(`/bookings/${bookingId}/request-cancellation`, {
    reason,
  });
  return response.data;
};

export const confirmBookingCancellation = async (
  bookingId: number
): Promise<Booking> => {
  const response = await axiosClient.patch(`/bookings/${bookingId}/confirm-cancellation`);
  return response.data;
};

export const rejectBookingCancellation = async (
  bookingId: number
): Promise<Booking> => {
  const response = await axiosClient.patch(`/bookings/${bookingId}/reject-cancellation`);
  return response.data;
};