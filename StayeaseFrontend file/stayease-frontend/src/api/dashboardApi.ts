import axiosClient from "./axiosClient";
import type {
  ApiResponse,
  BookingDashboardResponse,
  PropertyDashboardResponse,
} from "../types/models";

export const getBookingDashboard = async (
  ownerId: number
): Promise<BookingDashboardResponse> => {
  const response = await axiosClient.get<BookingDashboardResponse>(
    `/dashboard/owner/${ownerId}`
  );
  return response.data;
};

export const getPropertyDashboard = async (
  ownerId: number
): Promise<PropertyDashboardResponse> => {
  const response = await axiosClient.get<ApiResponse<any>>(
    `/property-dashboard/owner/${ownerId}`
  );
  
  const data = response.data.data;

  // Fix: Match the exact field names coming from the Backend DTO
  const totalRooms = data.totalRooms ?? 0;
  const availableRooms = data.availableRooms ?? 0; // Changed from data.totalAvailableRooms

  return {
    totalProperties: data.totalProperties ?? 0,
    totalRooms,
    availableRooms,
    bookedRooms: totalRooms - availableRooms,
    occupancyRate: totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0
  };
};