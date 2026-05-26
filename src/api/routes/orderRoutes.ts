import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../../services/orderService';
import { AppError, OrderStatus } from '../../domain/types';
import { VALID_STATUSES } from '../../domain/validator';

/** Wrap handlers so thrown errors reach the error middleware. */
function wrap(fn: (req: Request, res: Response) => unknown) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res);
    } catch (err) {
      next(err);
    }
  };
}

export function buildOrderRouter(service: OrderService): Router {
  const router = Router();

  router.get(
    '/',
    wrap((_req, res) => {
      res.json(service.list());
    }),
  );

  router.post(
    '/',
    wrap((req, res) => {
      const order = service.create(req.body);
      res.status(201).json(order);
    }),
  );

  router.get(
    '/:id',
    wrap((req, res) => {
      res.json(service.getById(req.params.id));
    }),
  );

  router.get(
    '/:id/pricing',
    wrap((req, res) => {
      res.json(service.pricing(req.params.id));
    }),
  );

  router.patch(
    '/:id/status',
    wrap((req, res) => {
      const status = req.body?.status as OrderStatus;
      if (!status || !VALID_STATUSES.includes(status)) {
        throw new AppError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
      }
      res.json(service.changeStatus(req.params.id, status));
    }),
  );

  router.delete(
    '/:id',
    wrap((req, res) => {
      service.remove(req.params.id);
      res.status(204).end();
    }),
  );

  return router;
}
