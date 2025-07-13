import { Listener, Subjects, ExpirationCompleteEvent, OrderStatus } from "@personalticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {

    // Implement the logic for handling the expiration complete event
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error("Order not found");
    }

    // If the order is already cancelled or completed, do nothing
    if (order.status === OrderStatus.Cancelled || order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    // Mark the order as expired
    order.set({ status:  OrderStatus.Cancelled});
    await order.save();

    // Publish an event to notify that the order has been cancelled
    await new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        },
    });

    // Acknowledge the message
    msg.ack();
  }
}