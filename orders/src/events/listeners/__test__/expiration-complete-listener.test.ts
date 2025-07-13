import { ExpirationCompleteEvent, OrderStatus } from "@personalticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

    // Create a fake ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 20,
    });
    // Save the ticket to the database
    await ticket.save();

    // Create a fake order associated with the ticket
    const order = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    // Save the order to the database
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };

    // Create a fake message object
    const msg: Message = {
        ack: jest.fn(),
    } as any;

    return { listener, data, msg, order, ticket};
}

it('updates the order status to cancelled', async () => {
    const { listener, data, msg, order } = await setup();

    // Call the onMessage function with the fake data and message
    await listener.onMessage(data, msg);

    // Fetch the updated order from the database
    const updatedOrder = await Order.findById(order.id);

    // Check that the order status has been updated to cancelled
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
    const { listener, data, msg, order } = await setup();

    // Call the onMessage function with the fake data and message
    await listener.onMessage(data, msg);

    // Check that the OrderCancelled event was published
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the fake data and message
    await listener.onMessage(data, msg);

    // Check that the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});