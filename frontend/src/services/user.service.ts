import { ApiClient } from '@/lib/api-client';
import { UserListResponse, User } from '@/types/auth.types';

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export class UserService {
  static getAll(): Promise<UserListResponse> {
    return ApiClient.get<UserListResponse>('/users');
  }

  static update(id: string, data: Partial<User>): Promise<UserResponse> {
    return ApiClient.put<UserResponse>(`/users/${id}`, data);
  }

  static delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/users/${id}`);
  }
}
