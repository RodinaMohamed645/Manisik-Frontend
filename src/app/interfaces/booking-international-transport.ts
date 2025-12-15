export interface BookingInternationalTransport {
  TransportId: number;
  Type?: string;
  CarrierName?: string;
  FlightNumber?: string;
  ShiptNumber?: string;
  DepartureAirport?: string;
  ArrivalAirport?: string;
  DepartureDate?: Date;
  NumberOfSeats: number;
  PricePerSeat?: number;
  TotalPrice?: number;
  Status?: number;
  BookingId?: number | null; // Optional: used to add to an existing pending booking
}
