import axiosClient from "./axiosClient";
import type { ApiResponse, Property, PropertyDetails, PropertyType} from "../types/models";

export interface CreatePropertyPayload {
  ownerId: number;
  title: string;
  description: string;
  propertyType: PropertyType;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  monthlyRent: number;
  amenities: string[];
}

export interface UpdatePropertyPayload {
  ownerId: number;
  title: string;
  description: string;
  propertyType: PropertyType;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  monthlyRent: number;
   amenities: string[];
}

export interface PropertySearchParams {
  city?: string;
  propertyType?: PropertyType;
  minRent?: number;
  maxRent?: number;
}

export const getAllProperties = async (): Promise<Property[]> => {
  const response = await axiosClient.get<ApiResponse<Property[]>>("/properties");
  return response.data.data;
};

export const getPropertyById = async (id: number): Promise<PropertyDetails> => {
  const response = await axiosClient.get<ApiResponse<PropertyDetails>>(`/properties/${id}`);
  return response.data.data;
};

export const createProperty = async (payload: CreatePropertyPayload): Promise<Property> => {
  const response = await axiosClient.post<ApiResponse<Property>>("/properties", payload);
  return response.data.data;
};

export const updateProperty = async (id: number, payload: UpdatePropertyPayload): Promise<Property> => {
  const response = await axiosClient.put<ApiResponse<Property>>(`/properties/${id}`, payload);
  return response.data.data;
};

export const deleteProperty = async (id: number): Promise<void> => {
  await axiosClient.delete(`/properties/${id}`);
};

export const searchProperties = async (params: PropertySearchParams): Promise<Property[]> => {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

  const response = await axiosClient.get<ApiResponse<Property[]>>("/properties/search", {
    params: cleanedParams,
  });
  return response.data.data;
};

export const getPropertiesByOwnerId = async (ownerId: number): Promise<Property[]> => {
  const response = await axiosClient.get<ApiResponse<Property[]>>(`/properties/owner/${ownerId}`);
  return response.data.data;
};

export const uploadPropertyImage = async (propertyId: number, file: File): Promise<Property> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosClient.post<ApiResponse<Property>>(
    `/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
};

export const deletePropertyImage = async (propertyId: number, imageIndex: number): Promise<Property> => {
  const response = await axiosClient.delete<ApiResponse<Property>>(
    `/properties/${propertyId}/images/${imageIndex}`
  );
  return response.data.data;
};