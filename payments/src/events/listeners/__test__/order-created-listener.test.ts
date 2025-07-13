import { OrderCreatedEvent, OrderStatus } from "@personalticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: "userId",
        expiresAt: new Date().toISOString(),
        status: OrderStatus.Created,
        version: 0,
        ticket: {
            id: "ticketId",
            price: 100
        },
    };

    // Mock the message object
    const msg: Message = {
        ack: jest.fn()
    } as any;

    return { listener, data, msg };
}

it('replicates the order created event', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.userId).toEqual(data.userId);
    expect(order!.status).toEqual(data.status);
    expect(order!.price).toEqual(data.ticket.price);
    expect(order!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});