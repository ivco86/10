import api from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (business_name: string, email: string, password: string, full_name?: string) =>
    api.post('/auth/register', { business_name, email, password, full_name }),

  me: () => api.get('/auth/me')
};
