const OrderIndex = ({ orders }) => {
    return (
      <div className="container py-5">
        <h2 className="mb-4 text-center">Your Orders</h2>
  
        {orders.length === 0 ? (
          <div className="text-center text-muted">You have no orders yet.</div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {orders.map((order) => (
              <div className="col" key={order.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{order.ticket.title}</h5>
                    <p className="text-muted mb-2">
                      Price: <strong>${order.ticket.price}</strong>
                    </p>
                    <span
                      className={`badge ${
                        order.status === "complete"
                          ? "bg-success"
                          : order.status === "cancelled"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <div className="mt-auto pt-3">
                      <a href={`/orders/${order.id}`} className="btn btn-outline-primary w-100">
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  OrderIndex.getInitialProps = async (ctx, client) => {
    const { data } = await client.get("/api/orders");
    return { orders: data };
  };
  
  export default OrderIndex;
  