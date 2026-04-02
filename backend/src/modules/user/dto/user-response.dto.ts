export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: Date;
}
