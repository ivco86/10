import api from './client';

interface SaleItem {
  product_id: number;
  quantity: number;
  discount_amount?: number;
}

interface CreateSale {
  items: SaleItem[];
  discount_amount?: number;
  payment_method: string;
  cash_received?: number;
}

export const salesApi = {
  create: (data: CreateSale) => api.post('/sales', data),
  list: () => api.get('/sales'),
  get: (id: number) => api.get(`/sales/${id}`)
};
