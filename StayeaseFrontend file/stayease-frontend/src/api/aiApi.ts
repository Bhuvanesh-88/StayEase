import axiosClient from "./axiosClient";
import type { Property, PropertySummaryResponse, RecommendationResponse } from "../types/models";

export const getPropertySummary = async (
  propertyId: number
): Promise<PropertySummaryResponse> => {
  const response = await axiosClient.get<PropertySummaryResponse>(
    `/ai/properties/${propertyId}/summary`
  );
  return response.data;
};

export const getRecommendations = async (
  tenantId: number
): Promise<Property[]> => {
  const response = await axiosClient.get<RecommendationResponse>(
    `/ai/recommendations/${tenantId}`
  );
  return response.data.recommendations;
};