import { createOrder, updateStatus, canShip } from '../src/domain/order';
import { OrderItem } from '../src/domain/types';

const baseItems: OrderItem[] = [
  { name: 'Widget', price: 50, quantity: 2 },
  { name: 'Gadget', price: 30, quantity: 1 },
];

describe('createOrder', () => {
  test('creates order with correct amount', () => {
    const order = createOrder({ id: 'ORD-001', customerId: 'CUST-1', items: baseItems });
    expect(order.amount).toBe(130);
    expect(order.status).toBe('pending');
  });

  test('applies premium discount', () => {
    const order = createOrder({ id: 'ORD-002', customerId: 'CUST-1', items: baseItems, isPremium: true });
    expect(order.finalPrice).toBeLessThan(order.amount);
  });

  test('applies large-order discount when amount >= 1000', () => {
    const items: OrderItem[] = [{ name: 'BigItem', price: 500, quantity: 3 }];
    const order = createOrder({ id: 'ORD-003', customerId: 'CUST-1', items });
    expect(order.finalPrice).toBe(1350);
  });

  test('throws on missing id', () => {
    expect(() => createOrder({ customerId: 'CUST-1', items: baseItems } as never)).toThrow();
  });

  test('throws on empty items array', () => {
    expect(() => createOrder({ id: 'ORD-004', customerId: 'CUST-1', items: [] })).toThrow();
  });

  test('throws on invalid item (non-numeric price)', () => {
    const badItems = [{ name: 'Bad', price: 'free', quantity: 1 }] as never;
    expect(() => createOrder({ id: 'ORD-005', customerId: 'CUST-1', items: badItems })).toThrow();
  });
});

describe('updateStatus', () => {
  test('transitions pending -> approved', () => {
    const order = createOrder({ id: 'ORD-010', customerId: 'CUST-2', items: baseItems });
    expect(updateStatus(order, 'approved').status).toBe('approved');
  });

  test('transitions pending -> rejected', () => {
    const order = createOrder({ id: 'ORD-011', customerId: 'CUST-2', items: baseItems });
    expect(updateStatus(order, 'rejected').status).toBe('rejected');
  });

  test('transitions approved -> shipped', () => {
    const order = createOrder({ id: 'ORD-012', customerId: 'CUST-2', items: baseItems });
    const approved = updateStatus(order, 'approved');
    expect(updateStatus(approved, 'shipped').status).toBe('shipped');
  });

  test('throws on invalid transition (pending -> shipped)', () => {
    const order = createOrder({ id: 'ORD-013', customerId: 'CUST-2', items: baseItems });
    expect(() => updateStatus(order, 'shipped')).toThrow(/Cannot transition/);
  });

  test('throws on invalid transition (rejected -> approved)', () => {
    const order = createOrder({ id: 'ORD-014', customerId: 'CUST-2', items: baseItems });
    const rejected = updateStatus(order, 'rejected');
    expect(() => updateStatus(rejected, 'approved')).toThrow(/Cannot transition/);
  });
});

describe('canShip', () => {
  test('returns true for approved order', () => {
    const order = createOrder({ id: 'ORD-020', customerId: 'CUST-3', items: baseItems });
    expect(canShip(updateStatus(order, 'approved'))).toBe(true);
  });

  test('returns false for pending order', () => {
    const order = createOrder({ id: 'ORD-021', customerId: 'CUST-3', items: baseItems });
    expect(canShip(order)).toBe(false);
  });
});
