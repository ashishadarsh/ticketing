import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
    description?: string; // description is added to the TicketAttrs interface
}

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string
    version: number; // version is used by mongoose to track document versions
    orderId?: string; // orderId is optional, it will be set when the ticket is reserved
    description?: string; // description is added to the TicketDoc interface
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String, // type is used by mongoose not typescript, 'S' as this is from global String constructor
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
            required: false, // orderId is optional, it will be set when the ticket is reserved
        },
        description: {
            type: String,
            required: false, // description is optional
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };