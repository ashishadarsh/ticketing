import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-event";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
  },
});

// Process the expiration queue
expirationQueue.process(async (job) => {
  const { orderId } = job.data;

  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId,
  });
  
});

// Export the expiration queue
export { expirationQueue };