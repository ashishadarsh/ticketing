import request from "supertest"
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

import { natsWrapper } from "../../nats-wrapper";

it('marks an order as cancelled', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(), // Use a new ObjectId for the ticket
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const user = global.signin();

    // Make a request to create an order with the ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    // Make sure the order was cancelled
    const updatedOrder = await Order.findById(order.id);
    
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(), // Use a new ObjectId for the ticket
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const user = global.signin();

    // Make a request to create an order with the ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);
            
    // Check if the event was published
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});