import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledEvent } from "@personalticketing/common";


const setup = async () => {
    
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    // Create a ticket
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: "Concert",
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({ orderId });
    await ticket.save();
    
    // Create a fake data event 
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
        id: ticket.id,
        },
    };
    
    // Create a fake message object
    const msg = {
        ack: jest.fn(),
    } as unknown as Message;
    
    return { listener, data, msg, ticket, orderId };
};

it("updates the ticket, publishes an event, and acks the message", async () => {
    const { listener, data, msg, ticket, orderId } = await setup();

    // Call the onMessage function with the fake data and message
    await listener.onMessage(data, msg);

    // Fetch the updated ticket from the database
    const updatedTicket = await Ticket.findById(ticket.id);

    // Ensure the ticket's orderId is cleared
    expect(updatedTicket!.orderId).toBeUndefined();

    expect(msg.ack).toHaveBeenCalled();

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});