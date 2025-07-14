import useRequest from "../../hooks/use-request";
import Router from "next/router";

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: `/api/orders`,
    method: "post",
    body: { ticketId: ticket.id },
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`)
  });

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="text-center mb-3">{ticket.title}</h2>
        <hr />
        <div className="mb-4">
          <h5 className="text-muted">Price:</h5>
          <p className="fs-4 fw-semibold">${ticket.price}</p>
        </div>

        {errors && <div className="alert alert-danger">{errors}</div>}

        <button onClick={() => doRequest()} className="btn btn-success w-100">
          Purchase Ticket
        </button>
      </div>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client, currentUser) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketShow;
