import { Subjects, PaymentCreatedEvent, Listener, OrderStatus } from "@personalticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    // Find the order associated with the payment
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Update the order status to paid
    order.set({ status: OrderStatus.Complete });
    await order.save();

    // Acknowledge the message
    msg.ack();
  }
}