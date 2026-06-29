// types/models.ts
export type UserRole = "OWNER" | "TENANT" | "ADMIN";

export interface User {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
}

export interface BookingDashboardResponse {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  cancellationRequests: number; // NEW
}

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

export type PropertyType = "PG" | "HOSTEL" | "APARTMENT";

export interface Room {
  roomId: number;
  propertyId: number;
  roomType: RoomType;
  rent: number;
  totalCount: number;
  availableCount: number;
  description?: string;
}

export interface PropertyDetails {
  property: Property;
  rooms: Room[];
}

export type RoomType = "SINGLE" | "DOUBLE" | "TRIPLE" | "DORM";

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  bookingId: number;
  roomId: number;
  tenantId: number;
  ownerId: number;
  requestedOn?: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  notes?: string;
  confirmedOn?: string | null;
  dailyRent?: number;
  numberOfDays?: number;
  totalAmount?: number;
  cancellationRequestedAt?: string; // NEW
  cancellationReason?: string; // NEW
}

export type AvailabilityReason = "BOOKING" | "CANCELLATION" | "MAINTENANCE";

export interface AvailabilityLog {
  availabilityLogId: number;
  roomId: number;
  changeValue: number;
  reason: AvailabilityReason;
  changedAt?: string;
  changedBy: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PropertyDashboardResponse {
  totalProperties: number;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  occupancyRate: number;
}

export interface PropertySummaryResponse {
  propertyId: number;
  summary: string;
}

export interface RecommendationResponse {
  recommendations: Property[];
}

export interface PropertyImageDto {
  imageId: number;
  fileName: string;
  fileType: string;
  imageData: string;
}

export interface Property {
  propertyId: number;
  ownerId: number;
  title: string;
  description: string;
  summary?: string;
  images?: PropertyImageDto[];
  propertyType: PropertyType;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  monthlyRent: number;
  amenities: string[]; // Changed from facilities string
  createdAt?: string;
}

// Amenities by property type
export const AMENITIES_BY_TYPE: Record<PropertyType, string[]> = {
  PG: [
    "WiFi",
    "AC",
    "Furnished",
    "Shared Kitchen",
    "Laundry",
    "Power Backup",
    "Parking",
    "TV",
    "Water Purifier",
    "Housekeeping",
    "Meals Included",
    "Geyser"
  ],
  HOSTEL: [
    "WiFi",
    "AC",
    "Common Room",
    "Kitchen Facility",
    "Laundry",
    "Power Backup",
    "24/7 Security",
    "Events",
    "Study Area",
    "Sports Facility",
    "Linen Provided",
    "Lockers"
  ],
  APARTMENT: [
    "WiFi",
    "AC",
    "Balcony",
    "Kitchen",
    "Parking",
    "Gym",
    "Pool",
    "Security",
    "Power Backup",
    "Water Tank",
    "Garden",
    "Community Hall"
  ]
};