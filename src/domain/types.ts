export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'shipped';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  amount: number;
  finalPrice: number;
  isPremium: boolean;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderInput {
  id: string;
  customerId: string;
  items: OrderItem[];
  isPremium?: boolean;
}

/** Domain error carrying an HTTP status code for the error middleware. */
export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
