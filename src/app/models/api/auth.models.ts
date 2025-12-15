export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  errors?: string[] | null;
  timestamp?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  country?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserDto {
  id?: number | null;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  country?: string | null;
  preferredLanguage?: 'en' | 'ar' | null;
  roles?: string[] | null;
  isActive?: boolean;
  fullName?: string | null;
  createdAt?: string | null;
}

export interface AuthResponseDto {
  token: string;
  tokenType?: string;
  expiresIn?: number;
  refreshToken?: string | null;
  expiresAt?: string;
  user: UserDto;
}

export interface AssignRoleDto {
  userId: number;
  roleName: string;
}
