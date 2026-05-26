import { createOrder, updateStatus } from '../domain/order';
import { getPricingBreakdown, PricingBreakdown } from '../domain/pricing';
import { AppError, CreateOrderInput, Order, OrderStatus } from '../domain/types';
import { IOrderRepository } from '../repositories/orderRepository';

/** Order management use cases. Stateless except for the injected repository. */
export class OrderService {
  constructor(private readonly repo: IOrderRepository) {}

  create(input: CreateOrderInput): Order {
    if (this.repo.has(input.id)) {
      throw new AppError(409, `Order '${input.id}' already exists`);
    }
    const order = createOrder(input);
    return this.repo.save(order);
  }

  list(): Order[] {
    return this.repo.list();
  }

  getById(id: string): Order {
    const order = this.repo.get(id);
    if (!order) throw new AppError(404, `Order '${id}' not found`);
    return order;
  }

  changeStatus(id: string, status: OrderStatus): Order {
    const current = this.getById(id);
    const updated = updateStatus(current, status);
    return this.repo.save(updated);
  }

  pricing(id: string): PricingBreakdown {
    const order = this.getById(id);
    return getPricingBreakdown(order.amount, order.isPremium);
  }

  remove(id: string): void {
    if (!this.repo.delete(id)) {
      throw new AppError(404, `Order '${id}' not found`);
    }
  }
}
