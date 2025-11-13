// TypeScript models converted from backend User entity
// Keep fields optional where appropriate and use simple JS-friendly types

import { BaseEntity } from "../BaseService";

export type Gender = "MALE" | "FEMALE" | "OTHER" | string;

export interface Role {
     id?: number;
     name: string;
     description?: string | null;
}

export interface User extends BaseEntity {
     username: string;
     email: string;
     password?: string | null;

     googleId?: string | null;
     firstName?: string | null;
     lastName?: string | null;
     fullName?: string | null;
     locale?: string | null;

     phone?: string | null;

     dob?: string | null;

     gender?: Gender;

     bio?: string | null;
     location?: string | null;

     avatarUrl?: string | null;
     refreshToken?: string | null;

     otp?: string | null;
     otpGeneratedTime?: string | null;

     isActive?: boolean;
     isDelete?: boolean;

     resetPasswordToken?: string | null;
     resetPasswordTokenExpiry?: string | null;

     authorities?: Role[];
}

export interface UserRequest {
     username: string;
     email: string;
     password?: string | null;
     id: number;
     firstName: string;
     lastName: string;
     phone: string;
     dob: string;
     gender: Gender;
}

export interface UserResponse extends User {
     id: number;

     username: string;
     email: string;
     firstName: string;
     lastName: string;
     phone: string;
     avatarUrl: string;

     dob: string;
     createdAt: string;
     updatedAt: string;
     
     gender: Gender;
     bio: string;
     mutualFriendsNum: string;
}

export interface UserView extends UserResponse {
     roles: string[];
}

// Note: This file is intentionally minimal. If the frontend needs more precise
// types (e.g., enums or nested DTOs), extend these interfaces and keep them
// in sync with backend contract.
