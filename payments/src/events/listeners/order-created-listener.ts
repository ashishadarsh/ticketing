import { Listener, Subjects, OrderCreatedEvent } from "@personalticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const { id, userId, status, version } = data;

        const order = Order.build({
            id,
            userId,
            status,
            price: data.ticket.price,
            version
        });

        await order.save();

        msg.ack();
    }
}