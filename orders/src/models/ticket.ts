import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from './order';

interface TicketAttrs {
    id: string; // This is the ID of the ticket, which will be used to create a new document
    title: string   
    price: number
}

export interface TicketDoc extends mongoose.Document {
    title: string   
    price: number
    version: number; // Version field for optimistic concurrency control
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string; version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0, // Ensure price is a non-negative number
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

ticketSchema.set('versionKey', 'version'); // Use 'version' as the version key
ticketSchema.plugin(updateIfCurrentPlugin); // Apply the update-if-current plugin

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id, // Use the provided ID as the _id of the document
        title: attrs.title,
        price: attrs.price,
    });
};

ticketSchema.statics.findByEvent = async (event: { id: string; version: number }) => {
    // This method finds a ticket by its ID and version for optimistic concurrency control
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1, // Ensure we are working with the correct version
    });
};

ticketSchema.methods.isReserved = async function () {
    // This method will check if the ticket is reserved by looking for existing orders
    // that are not cancelled.
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
             $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete]
        }
    });
    return !!existingOrder; // Returns true if an order exists, indicating the ticket is reserved
}
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };