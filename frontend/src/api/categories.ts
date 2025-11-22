import api from './client';

export const categoriesApi = {
  list: () => api.get('/products/categories'),
  create: (data: { name: string; description?: string }) => api.post('/products/categories', data),
  update: (id: number, data: any) => api.put(`/products/categories/${id}`, data),
  delete: (id: number) => api.delete(`/products/categories/${id}`)
};
