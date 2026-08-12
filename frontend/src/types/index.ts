export const OrderStatus = {
  Created: 0,
  Picking: 1,
  Packed: 2,
  Shipped: 3,
  Invoiced: 4,
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export interface DashboardData {
  totalOrders: number;
  picking: number;
  packed: number;
  shipped: number;
  invoiced: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSKU: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  statusInt: number;
  createdAt: string;
  quickBooksInvoiceId: string | null;
  totalAmount: number;
  totalItems: number;
  items: OrderItem[];
}

export interface Customer {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  availableQuantity: number;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: string;
  items: CreateOrderItemInput[];
}
