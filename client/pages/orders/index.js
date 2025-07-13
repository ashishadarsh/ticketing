const orderIndex = ({orders}) => {
    return <ul>
        {orders.map(order => {
            return <li key={order.id}>
                {order.ticket.title} - {order.status} - {order.ticket.price}
            </li>
        })}
    </ul>
}

orderIndex.getInitialProps = async (ctx, client) => {
    const { data } = await client.get('/api/orders');
    
    return { orders: data };
}

export default orderIndex;