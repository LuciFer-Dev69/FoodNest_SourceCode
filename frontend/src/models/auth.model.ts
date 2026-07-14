export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  token?: string;
  user?: AuthUser;
  requires2FA?: boolean;
  userId?: number;
  email?: string;
  name?: string;
};
