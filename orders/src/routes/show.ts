import express, { Request, Response} from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@personalticketing/common';

import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId).populate('ticket');

    // If the order does not exist, throw an error
    if(!order) {
        throw new NotFoundError();
    }

    // Make sure the order belongs to the user
    if(order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    // Send the order
    res.send(order);
});


export {router as showOrderRouter};