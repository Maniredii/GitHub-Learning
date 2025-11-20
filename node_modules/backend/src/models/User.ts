export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password_hash: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password_hash?: string;
}
