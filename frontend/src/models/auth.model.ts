export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider?: string;
  profilePicture?: string | null;
};

export type AuthResponse = {
  token?: string;
  user?: AuthUser;
  message?: string;
  requires2FA?: boolean;
  userId?: string;
  code?: string;
  otp?: string;
};
