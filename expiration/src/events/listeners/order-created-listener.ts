import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@personalticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        // Add the order to the expiration queue
        await expirationQueue.add(
            {
                orderId: data.id,
            },
            {
                delay: delay > 0 ? delay : 0, // Ensure the delay is not negative
            }
        );

        console.log(`Order created with ID: ${data.id}, scheduled for expiration in ${delay} ms`);

        // Acknowledge the message
        msg.ack();
    }

}