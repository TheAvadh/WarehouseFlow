import type { DashboardData, Order, Customer, Product, CreateOrderInput } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://warehouseflow-10jo.onrender.com/api/';

export default API_BASE_URL;
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Fallback to status text
      }
      throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 240 || response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Failed to connect to backend server. Make sure backend is running.', 500);
  }
}

export const api = {
  getDashboard: (): Promise<DashboardData> => request<DashboardData>('/dashboard'),
  
  // Orders
  getOrders: (): Promise<Order[]> => request<Order[]>('/orders'),
  getOrderById: (id: string): Promise<Order> => request<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderInput): Promise<Order> =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  pickOrder: (id: string): Promise<Order> => request<Order>(`/orders/${id}/pick`, { method: 'POST' }),
  packOrder: (id: string): Promise<Order> => request<Order>(`/orders/${id}/pack`, { method: 'POST' }),
  shipOrder: (id: string): Promise<Order> => request<Order>(`/orders/${id}/ship`, { method: 'POST' }),
  invoiceOrder: (id: string): Promise<Order> => request<Order>(`/orders/${id}/invoice`, { method: 'POST' }),

  // Customers
  getCustomers: (): Promise<Customer[]> => request<Customer[]>('/customers'),
  createCustomer: (name: string): Promise<Customer> =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  updateCustomer: (id: string, name: string): Promise<Customer> =>
    request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
  deleteCustomer: (id: string): Promise<void> =>
    request<void>(`/customers/${id}`, {
      method: 'DELETE',
    }),

  // Products
  getProducts: (): Promise<Product[]> => request<Product[]>('/products'),
  createProduct: (data: { sku: string; name: string; price: number; availableQuantity: number }): Promise<Product> =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: { sku: string; name: string; price: number; availableQuantity: number }): Promise<Product> =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string): Promise<void> =>
    request<void>(`/products/${id}`, {
      method: 'DELETE',
    }),
};
