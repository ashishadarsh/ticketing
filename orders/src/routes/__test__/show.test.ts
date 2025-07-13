import request from "supertest"
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it('fetches the order', async () => {

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

    // Make a request to fetch the order
    const { body: fetchOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(200);

    // Make sure we got the order back
    expect(fetchOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {

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

    // Make a request to fetch the order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin()) // Different user
        .expect(401);
});