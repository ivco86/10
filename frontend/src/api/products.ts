import api from './client';

export const productsApi = {
  list: () => api.get('/products'),
  search: (q: string) => api.get(`/products/search?q=${encodeURIComponent(q)}`),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`)
};
