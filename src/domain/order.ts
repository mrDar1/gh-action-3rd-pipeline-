import { calculateFinalPrice } from './pricing';
import { validateOrder } from './validator';
import { CreateOrderInput, Order, OrderStatus, AppError } from './types';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['approved', 'rejected'],
  approved: ['shipped'],
  rejected: [],
  shipped: [],
};

export function createOrder({ id, customerId, items, isPremium = false }: CreateOrderInput): Order {
  if (!id || !customerId || !Array.isArray(items) || items.length === 0) {
    throw new AppError(400, 'Missing required order fields');
  }

  const amount = items.reduce((sum, item) => {
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      throw new AppError(400, 'Each item must have numeric price and quantity');
    }
    return sum + item.price * item.quantity;
  }, 0);

  const order: Order = {
    id,
    customerId,
    items,
    amount: parseFloat(amount.toFixed(2)),
    finalPrice: calculateFinalPrice(amount, isPremium),
    isPremium,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const { valid, errors } = validateOrder(order);
  if (!valid) throw new AppError(400, `Invalid order: ${errors.join('; ')}`);

  return order;
}

export function updateStatus(order: Order, newStatus: OrderStatus): Order {
  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed) throw new AppError(409, `Unknown current status: ${order.status}`);
  if (!allowed.includes(newStatus)) {
    throw new AppError(409, `Cannot transition from '${order.status}' to '${newStatus}'`);
  }
  return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
}

export function canShip(order: Order): boolean {
  return order.status === 'approved' && order.amount > 0;
}
