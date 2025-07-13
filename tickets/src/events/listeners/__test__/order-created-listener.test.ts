import { OrderCreatedEvent, OrderStatus } from "@personalticketing/common";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedListener } from "../order-created-listener";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";


const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);
    
    // Create a ticket
    const ticket = Ticket.build({
        title: "Concert",
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    
    // Create a fake data event
    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toISOString(),
        ticket: {
        id: ticket.id,
        price: ticket.price,
        },
    };
    
    // Create a fake message object
    const msg: Message = {
        ack: jest.fn(),
    } as any;
    
    return { listener, data, msg, ticket };
}

it("sets the orderId of the ticket", async () => {
    const { listener, data, msg, ticket } = await setup();

    // Call the onMessage function with the fake data and message
    await listener.onMessage(data, msg);

    // Fetch the updated ticket from the database
    const updatedTicket = await Ticket.findById(ticket.id);

    // Ensure the ticket's orderId is set correctly
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the fake data and message
    await listener.onMessage(data, msg);

    // Ensure the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg, ticket } = await setup();

    // Call the onMessage function with the fake data and message
    await listener.onMessage(data, msg);

    // Ensure the TicketUpdatedPublisher was called with the correct data
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    
    expect(ticketUpdatedData.id).toEqual(ticket.id);
    expect(ticketUpdatedData.orderId).toEqual(data.id);
});