// api/roomApi.ts
import axiosClient from "./axiosClient";
import type { ApiResponse, Room } from "../types/models";
import type { RoomType } from "../types/models";

export interface CreateRoomPayload {
  propertyId: number;
  roomType: RoomType;
  rent: number;
  totalCount: number;
  availableCount?: number;
  description?: string;
}

export interface UpdateRoomPayload {
  propertyId: number;
  roomType: RoomType;
  rent: number;
  totalCount: number;
  availableCount: number;
  description?: string;
}

export const getRoomsByPropertyId = async (propertyId: number): Promise<Room[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<Room[]>>(
      `/rooms/property/${propertyId}`
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

export const getRoomById = async (roomId: number): Promise<Room> => {
  try {
    const response = await axiosClient.get<ApiResponse<Room>>(
      `/rooms/${roomId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching room:", error);
    throw error;
  }
};

export const createRoom = async (payload: CreateRoomPayload): Promise<Room> => {
  try {
    const response = await axiosClient.post<ApiResponse<Room>>(
      "/rooms",
      {
        propertyId: payload.propertyId,
        roomType: payload.roomType,
        rent: payload.rent,
        totalCount: payload.totalCount,
        availableCount: payload.totalCount, // Always set to totalCount on creation
        description: payload.description || "",
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

export const updateRoom = async (
  roomId: number,
  payload: UpdateRoomPayload
): Promise<Room> => {
  try {
    const response = await axiosClient.put<ApiResponse<Room>>(
      `/rooms/${roomId}`,
      {
        propertyId: payload.propertyId,
        roomType: payload.roomType,
        rent: payload.rent,
        totalCount: payload.totalCount,
        availableCount: payload.availableCount,
        description: payload.description || "",
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
};

export const updateRoomAvailability = async (
  roomId: number,
  availableCount: number
): Promise<Room> => {
  try {
    const response = await axiosClient.patch<ApiResponse<Room>>(
      `/rooms/${roomId}/availability`,
      {},
      {
        params: { availableCount },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating room availability:", error);
    throw error;
  }
};

export const deleteRoom = async (roomId: number): Promise<void> => {
  try {
    await axiosClient.delete(`/rooms/${roomId}`);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};