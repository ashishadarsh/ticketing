import { Publisher, Subjects, TicketUpdatedEvent } from "@personalticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}