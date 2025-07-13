import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

stan.on('connect', async () => {
    console.log("connected to publish");
    
   const publisher =  new TicketCreatedPublisher(stan);
   try {
        await publisher.publish({
            id: '12345',
            title: 'concert',
            price: 50
        })
   } catch(error) {
        console.error(error);
   }

});