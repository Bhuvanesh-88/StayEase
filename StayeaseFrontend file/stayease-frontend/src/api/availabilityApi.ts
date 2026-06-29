import axiosClient from "./axiosClient";

export const getAvailabilityByRoom = async (roomId: number) => {
  const response = await axiosClient.get(`/availability/room/${roomId}`);
  return response.data;
};