import { PaymentCreatedEvent, Publisher, Subjects } from "@personalticketing/common";
import { Message } from "node-nats-streaming";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}