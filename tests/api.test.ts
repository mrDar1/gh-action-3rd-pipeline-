import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryOrderRepository } from '../src/repositories/orderRepository';

function app() {
  return createApp(new InMemoryOrderRepository());
}

const sampleOrder = {
  id: 'ORD-100',
  customerId: 'CUST-9',
  items: [{ name: 'Widget', price: 50, quantity: 2 }],
};

describe('Order API', () => {
  test('GET /health', async () => {
    const res = await request(app()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /api/orders creates an order', async () => {
    const res = await request(app()).post('/api/orders').send(sampleOrder);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('ORD-100');
    expect(res.body.amount).toBe(100);
    expect(res.body.status).toBe('pending');
  });

  test('POST duplicate id returns 409', async () => {
    const a = app();
    await request(a).post('/api/orders').send(sampleOrder);
    const res = await request(a).post('/api/orders').send(sampleOrder);
    expect(res.status).toBe(409);
  });

  test('POST invalid body returns 400', async () => {
    const res = await request(app()).post('/api/orders').send({ id: 'X' });
    expect(res.status).toBe(400);
  });

  test('GET /api/orders/:id returns 404 when missing', async () => {
    const res = await request(app()).get('/api/orders/nope');
    expect(res.status).toBe(404);
  });

  test('full lifecycle: create -> approve -> ship', async () => {
    const a = app();
    await request(a).post('/api/orders').send(sampleOrder);

    const approved = await request(a).patch('/api/orders/ORD-100/status').send({ status: 'approved' });
    expect(approved.status).toBe(200);
    expect(approved.body.status).toBe('approved');

    const shipped = await request(a).patch('/api/orders/ORD-100/status').send({ status: 'shipped' });
    expect(shipped.body.status).toBe('shipped');
  });

  test('invalid transition returns 409', async () => {
    const a = app();
    await request(a).post('/api/orders').send(sampleOrder);
    const res = await request(a).patch('/api/orders/ORD-100/status').send({ status: 'shipped' });
    expect(res.status).toBe(409);
  });

  test('GET pricing breakdown', async () => {
    const a = app();
    await request(a).post('/api/orders').send(sampleOrder);
    const res = await request(a).get('/api/orders/ORD-100/pricing');
    expect(res.status).toBe(200);
    expect(res.body.finalPrice).toBe(100);
  });

  test('DELETE removes the order', async () => {
    const a = app();
    await request(a).post('/api/orders').send(sampleOrder);
    expect((await request(a).delete('/api/orders/ORD-100')).status).toBe(204);
    expect((await request(a).get('/api/orders/ORD-100')).status).toBe(404);
  });
});
