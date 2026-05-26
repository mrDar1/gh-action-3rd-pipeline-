import { Order } from '../domain/types';

export interface IOrderRepository {
  has(id: string): boolean;
  get(id: string): Order | undefined;
  list(): Order[];
  save(order: Order): Order;
  delete(id: string): boolean;
  clear(): void;
}

/** In-memory order store. Data resets on process restart. */
export class InMemoryOrderRepository implements IOrderRepository {
  private orders = new Map<string, Order>();

  has(id: string): boolean {
    return this.orders.has(id);
  }

  get(id: string): Order | undefined {
    return this.orders.get(id);
  }

  list(): Order[] {
    return Array.from(this.orders.values());
  }

  save(order: Order): Order {
    this.orders.set(order.id, order);
    return order;
  }

  delete(id: string): boolean {
    return this.orders.delete(id);
  }

  clear(): void {
    this.orders.clear();
  }
}
