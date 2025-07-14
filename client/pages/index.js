import Link from "next/link";

const LandingPage = ({ currentUser, tickets }) => {
  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Available Tickets</h2>

      {tickets.length === 0 ? (
        <div className="text-center text-muted">No tickets available</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {tickets.map((ticket) => (
            <div className="col" key={ticket.id}>
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{ticket.title}</h5>
                  <p className="card-text text-muted mb-4">
                    Price: <strong>${ticket.price}</strong>
                  </p>
                  <div className="mt-auto">
                    <Link
                      href="/tickets/[ticketId]"
                      as={`/tickets/${ticket.id}`}
                      className="btn btn-outline-primary w-100"
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
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};

export default LandingPage;
