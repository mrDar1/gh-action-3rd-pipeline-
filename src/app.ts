import express from 'express';
import { buildOrderRouter } from './api/routes/orderRoutes';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler';
import { InMemoryOrderRepository, IOrderRepository } from './repositories/orderRepository';
import { OrderService } from './services/orderService';

export function createApp(repo: IOrderRepository = new InMemoryOrderRepository()) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const service = new OrderService(repo);
  app.use('/api/orders', buildOrderRouter(service));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
