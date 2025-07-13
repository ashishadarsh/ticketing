import express, { Request, Response } from 'express';

import { NotAuthorizedError, NotFoundError, requireAuth } from '@personalticketing/common';

import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

import { Order, OrderStatus } from '../models/order';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Complete) {
        throw new Error('Cannot delete completed orders');
    }
    if (order.status === OrderStatus.Cancelled) {
        throw new Error('Cannot delete cancelled orders');
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publishing an event saying that an order was cancelled
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        },
    });

    res.status(204).send(order);
});

export { router as deleteOrderRouter };