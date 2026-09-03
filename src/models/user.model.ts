export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export type UserRequest = Omit<User, 'id' | 'role'>;
