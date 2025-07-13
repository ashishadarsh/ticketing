import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@personalticketing/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

// jest.mock('../../stripe');

it('returns a 404 if the order does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '123',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that doesnot belong to the user', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: orderId,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        version: 0
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '123',
            orderId: orderId
        })
        .expect(401);
});

it('returns a 400 when trying to purchase a cancelled order', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: orderId,
        userId: userId,
        status: OrderStatus.Created,
        price: 20,
        version: 0
    });
    await order.save();

    // Cancel the order
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: '123',
            orderId: orderId
        })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);

    const order = Order.build({
        id: orderId,
        userId: userId,
        status: OrderStatus.Created,
        price,
        version: 0
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: orderId
        })
        .expect(201);

    //expect(stripe.charges.create).toHaveBeenCalled();

    // const chargeArgs = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeArgs.amount).toEqual(order.price * 100); // Convert to cents
    // expect(chargeArgs.currency).toEqual('usd');
    // expect(chargeArgs.source).toEqual('tok_visa');

    // Verify the charge was created in Stripe
    const stripeCharges = await stripe.charges.list({ limit : 50 });
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === order.price * 100 && charge.currency === 'usd');

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.amount).toEqual(order.price * 100);
    expect(stripeCharge!.currency).toEqual('usd');

    // Check if the payment was saved to the database
    const payment = await Payment.findOne({
        orderId: orderId,
        stripeId: stripeCharge!.id
    });
    expect(payment).not.toBeNull();
    expect(payment!.orderId).toEqual(orderId);
    expect(payment!.stripeId).toEqual(stripeCharge!.id);
});