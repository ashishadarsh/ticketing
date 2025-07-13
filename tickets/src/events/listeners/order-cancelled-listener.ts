import { Listener, OrderCancelledEvent, Subjects } from "@personalticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { Message } from "node-nats-streaming";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
    
        // If no ticket is found, throw an error
        if (!ticket) {
        throw new Error("Ticket not found");
        }
    
        // If a ticket is found, unmark it as reserved by clearing its orderId property
        ticket.set({ orderId: undefined });
    
        // Save the ticket
        await ticket.save();
    
        // Publish an event to notify that the ticket has been updated
        await new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        orderId: ticket.orderId,
        });
    
        msg.ack(); // Acknowledge the message after processing
    }
}