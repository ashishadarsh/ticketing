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
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <div className="mb-5">
        <h1 className="display-5 fw-bold text-dark mb-3">{ticket.title}</h1>
        <p className="text-muted">Buy your ticket securely</p>
      </div>

      <div className="mb-4">
        <h6 className="text-uppercase text-secondary fw-semibold mb-1">Price</h6>
        <p className="fs-4 fw-semibold text-dark">${ticket.price}</p>
      </div>

      <div className="mb-5">
        <h6 className="text-uppercase text-secondary fw-semibold mb-1">Description</h6>
        <p className="fs-5 text-dark lh-lg" style={{ whiteSpace: 'pre-wrap' }}>
          {ticket.description}
        </p>
      </div>

      {errors && <div className="alert alert-danger">{errors}</div>}

      <div className="d-flex justify-content-start">
        <button
          onClick={() => doRequest()}
          className="btn btn-primary btn-lg px-4 shadow-sm"
        >
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
