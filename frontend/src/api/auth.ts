import { api } from './http';

export interface User {
  id: number;
  email: string;
}

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authApi = {
  signUp: async (data: SignUpData) => {
    const response = await api.post<{ user: User }>('/auth/signup', data);
    return response.data;
  },

  signIn: async (data: SignInData) => {
    const response = await api.post<{ user: User }>('/auth/signin', data);
    return response.data;
  },

  signOut: async () => {
    const response = await api.post('/auth/signout');
    return response.data;
  },

  me: async () => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },
};
