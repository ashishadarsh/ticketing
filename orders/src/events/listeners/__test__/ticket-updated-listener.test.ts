import { TicketUpdatedEvent } from "@personalticketing/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
    // Create an instance of the TicketUpdatedListener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create a mock ticket instance to simulate an existing ticket in the database
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(), // Generate a new ObjectId for the ticket
        title: 'concert',
        price: 10,
    });

    // Save the ticket to the database
    await ticket.save();

    // Create a mock data object that matches the TicketUpdatedEvent structure
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: ticket.title,
        price: ticket.price + 5, // Increment the price for the update
        userId: new mongoose.Types.ObjectId().toHexString(), // Generate a new ObjectId for the user
        version: ticket.version + 1, // Incremented version for the update
    };

    // Mocking the Message type
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, ticket };
}

it('updates and saves a ticket when a TicketUpdated event is received', async () => {
    const { listener, data, msg, ticket } = await setup();

    // Call the onMessage method with the data and mock message
    await listener.onMessage(data, msg);

    // Find the updated ticket in the database
    const updatedTicket = await Ticket.findById(ticket.id);

    // Assertions to verify the ticket was updated correctly
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message after processing', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage method with the data and mock message
    await listener.onMessage(data, msg);

    // Verify that the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has skipped version number', async () => {
    const { listener, data, msg, ticket } = await setup();

    // Modify the version to simulate a skipped version
    data.version = 10; // Skip version

    // Call the onMessage method with the modified data and mock message
    try {
        await listener.onMessage(data, msg);
    } catch (err) {
        // Expect an error to be thrown
        expect(err).toBeDefined();
    }

    // Verify that the ack function was not called
    expect(msg.ack).not.toHaveBeenCalled();
});