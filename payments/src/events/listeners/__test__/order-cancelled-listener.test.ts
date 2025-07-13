import { OrderCancelledEvent, OrderStatus } from "@personalticketing/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import mongoose from "mongoose";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: "userId",
        status: OrderStatus.Created, // Initial status
        price: 100,
        version: 0
    })

    await order.save();

    const data: OrderCancelledEvent["data"] = {
        id: order.id,   
        version: 1,
        ticket: {
            id: "ticketId"
        }
    };

    // Mock the message object
    const msg: Message = {
        ack: jest.fn()
    } as any;

    return { listener, data, msg, order };
}

it("updates the order status to cancelled", async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});