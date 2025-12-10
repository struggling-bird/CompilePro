import request from '../utils/request';

export interface RegisterParams {
  email: string;
  password: string;
  username?: string;
  phone?: string;
}

// Mock implementation for demonstration since there is no backend
export const register = async (params: RegisterParams): Promise<any> => {
  // In a real scenario:
  // return request('/auth/register', {
  //   method: 'POST',
  //   data: params,
  // });

  // Mock response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Registering user:', params);
      // Simulate success
      resolve({ success: true, message: 'Registration successful' });
      // Simulate failure:
      // reject(new Error('Email already exists'));
    }, 1000);
  });
};
