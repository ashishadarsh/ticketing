import { TicketCreatedEvent } from "@personalticketing/common";
import { Message } from "node-nats-streaming";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";

const setup = async () => {
    // Create an instance of the TicketCreatedListener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // Create a mock data object that matches the TicketCreatedEvent structure
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(), // Generate a new ObjectId for the ticket
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(), // Generate a new ObjectId for the user
        version: 0,
    };

    // Mocking the Message type
    // This is a mock message object that will be passed to the listener
    const msg: Message = {
        ack: jest.fn(),
    } as any;

    return { listener, data, msg };
}

it('creates and saves a ticket when a TicketCreated event is received', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    
    const ticket = await Ticket.findById(data.id);
    
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
})

it('acknowledges the message after processing', async () => {
    const { listener, data, msg } = await setup();
    
    await listener.onMessage(data, msg);
    
    expect(msg.ack).toHaveBeenCalled();
});