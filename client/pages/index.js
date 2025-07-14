import Link from "next/link";

const LandingPage = ({ currentUser, tickets }) => {
  return (
    <div className="container py-5">
      <h1 className="text-center fw-bold text-primary mb-5">🎟️ Available Tickets</h1>

      {tickets.length === 0 ? (
        <div className="text-center text-muted fs-5">No tickets available</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {tickets.map((ticket) => (
            <div className="col" key={ticket.id}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="text-center fw-semibold text-dark mb-3">
                    {ticket.title}
                  </h5>

                  <p className="text-muted mb-2">
                    <span className="fw-semibold">Price:</span> ${ticket.price}
                  </p>

                  <p
                    className="text-muted text-truncate mb-4"
                    style={{ maxWidth: "100%" }}
                    title={ticket.description}
                  >
                    <span className="fw-semibold">Description:</span> {ticket.description}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href="/tickets/[ticketId]"
                      as={`/tickets/${ticket.id}`}
                      className="btn btn-primary w-100"
                    >
                      View Ticket
                    </Link>
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

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");
  return { tickets: data };
};

export default LandingPage;
