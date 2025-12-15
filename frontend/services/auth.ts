import request from '../utils/request';

export interface RegisterParams {
  email: string;
  password: string;
  username?: string;
  phone?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export interface CurrentUserResult {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive';
}

export const register = async (params: RegisterParams): Promise<void> => {
  await request('/apis/auth/register', {
    method: 'POST',
    data: params,
  });
};

export const login = async (params: LoginParams): Promise<LoginResult> => {
  return request<LoginResult>('/apis/auth/login', {
    method: 'POST',
    data: params,
  });
};

export const getCurrentUser = async (): Promise<CurrentUserResult> => {
  return request<CurrentUserResult>('/apis/auth/me', {
    method: 'GET',
  });
};
