export interface RoomDto {
  id?: number | null;
  hotelId: number;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  totalRooms?: number | null;
  availableRooms?: number | null;
  isActive?: boolean | null;
}

export interface HotelDto {
  id?: number | null;
  name: string;
  city: string;
  address: string;
  pricePerNight?: number | null; // added
  availableRooms?: number | null; // added
  starRating?: number | null;
  distanceToHaram?: number | null;
  description?: string | null;
  descriptionAr?: string | null; // added
  amenities?: string | null; // added
  imageUrl?: string | null;
  rooms?: RoomDto[] | null;
  isActive?: boolean | null;
}

export interface SubscriberDto {
  subscriberId?: number | null;
  email: string;
}
