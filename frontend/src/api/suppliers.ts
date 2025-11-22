import api from './client';

export const suppliersApi = {
  list: () => api.get('/suppliers'),
  search: (q: string) => api.get(`/suppliers/search?q=${encodeURIComponent(q)}`),
  get: (id: number) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: number, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
  getProducts: (id: number) => api.get(`/suppliers/${id}/products`),
  getOrders: (id: number) => api.get(`/suppliers/${id}/orders`),
};
