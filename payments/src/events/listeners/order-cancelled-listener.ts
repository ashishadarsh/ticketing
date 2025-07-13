import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@personalticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const { id, version } = data;

        // Find the order by ID and version
        const order = await Order.findOne({
            _id: id,
            version: version - 1 // Ensure we are updating the correct version
        });

        if (!order) {
            throw new Error("Order not found");
        }
        
        // Update the order status to cancelled
        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        // Acknowledge the message
        msg.ack();
    }
}