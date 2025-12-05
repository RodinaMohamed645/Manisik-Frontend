export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin',
  HOTEL_MANAGER = 'HotelManager'
}

export interface User {
  id: string | number;  // Backend returns number in some cases, string in others
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt?: string;  //Optional - not always included
  preferredLanguage?: string;
  isActive?: boolean;
  fullName?: string;
  updatedAt?: string;  // Optional - not always included
  phoneNumber?: string;  // Alias for phone
  country?: string;
  roles?: string[];  // Array of role names
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstNam?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

export interface MinimalUser {
  firstName: string;
  lastName: string;
  roles: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string | null;
    refreshToken: string | null;
    expiresAt: string;
    expiresIn?: number;
    tokenType?: string;
    user: {
      id: number | string;  // Backend returns number, User uses string
      email: string;
      password?: string | null;
      firstName: string;
      lastName: string;
      role: UserRole;
      phoneNumber?: string;
      country?: string;
      roles?: string[];
      isActive?: boolean;
      createdAt?: string;
      updatedAt?: string;
      fullName?: string;
    };
  };
  errors: any;
  timestamp: string;
}


export interface RegisterResponse {
    success: boolean;
    message: string;
    roles?: UserRole;
    token?: string;
}
