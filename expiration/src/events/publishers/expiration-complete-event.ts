import { Subjects, Publisher, ExpirationCompleteEvent } from "@personalticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    // No additional methods or properties are needed for this publisher
    // It simply extends the Publisher class with the specific subject
}