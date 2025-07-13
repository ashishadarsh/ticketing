import { Message } from "node-nats-streaming";

import { Subjects, TicketUpdatedEvent, Listener } from "@personalticketing/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, title, price } = data;

    // Find the ticket by ID & version
    const ticket = await Ticket.findByEvent(data);

    // If the ticket does not exist, throw an error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Update the ticket's properties
    ticket.set({ title, price });

    // Save the updated ticket
    await ticket.save();

    // Acknowledge the message
    msg.ack();
  }
}