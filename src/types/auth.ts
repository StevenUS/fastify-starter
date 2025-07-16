export interface CreateSessionParams {
  userId: number;
  userAgent: string | null;
  ipAddress: string | null;
}

export interface LoginParams {
  username: string;
  password: string;
  userAgent: string | null;
  ipAddress: string | null;
}
