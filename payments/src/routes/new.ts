import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@personalticketing/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', requireAuth, 
    [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
    validateRequest,
    async (req: Request, res: Response) => {

    const { orderId, token } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        throw new NotFoundError();
    }

    // Check if the order belongs to the user
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if( order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for a cancelled order');
    }
    
    // Proceed with payment logic here (e.g., create a charge, etc.)
    const charge = await stripe.charges.create({
        amount: order.price * 100, // Convert to cents
        currency: 'usd',
        source: token,
        description: `Payment for order ${order.id}`,
    });
    // Save the payment to the database
    const payment = Payment.build({
        orderId,
        stripeId: charge.id
    });
    await payment.save();

    // Publish an event to notify other services
    new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
    });
    
    res.status(201).send({ id: payment.id });      
})

export { router as createChargeRouter };