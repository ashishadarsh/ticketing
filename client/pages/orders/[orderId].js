import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import Router from "next/router";

// Load Stripe key
const stripePromise = loadStripe("pk_test_51RjdOAR8IQhpv1s7zQXqtCsrov6HX9LDhhFxl8eImrS0K9Dy8PTP9pzuMGM1gRbuk2NsdBPw1xz0angK13WOtdW900uw17f0Ks");

// ✅ Payment form inside modal
const PaymentForm = ({ order, close }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    const { token, error: tokenError } = await stripe.createToken(cardElement);

    if (tokenError) {
      setError(tokenError.message);
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/payments", {
        orderId: order.id,
        token: token.id,
      });

      setSuccess(true);
      setTimeout(() => {
        close();
        Router.push("/orders");
      }, 1500);
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h5 className="mb-3">Enter Payment Details</h5>
      <div className="mb-3 p-2 border rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      {error && <div className="alert alert-danger py-1">{error}</div>}
      {success && <div className="alert alert-success py-1">Payment successful!</div>}

      <button type="submit" className="btn btn-success w-100 mt-3" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

// ✅ Main page component
const orderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => clearInterval(timerId);
  }, []);

  if (timeLeft < 0) return <div className="container py-5 text-center text-danger fs-4">Order has expired.</div>;

  return (
    <div className="container py-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "500px" }}>
        <h2 className="mb-3 text-center">{order.ticket.title}</h2>
        <p className="fs-5">Price: <strong>${order.ticket.price}</strong></p>
        <p className="text-muted">Time left to pay: <strong>{timeLeft}</strong> seconds</p>

        <div className="d-grid">
          <button className="btn btn-primary" onClick={() => setOpenDialog(true)}>
            Pay with Card
          </button>
        </div>
      </div>

      {/* Modal */}
      {openDialog && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title">Secure Payment</h5>
                <button type="button" className="btn-close" onClick={() => setOpenDialog(false)}></button>
              </div>
              <div className="modal-body">
                <Elements stripe={stripePromise}>
                  <PaymentForm order={order} close={() => setOpenDialog(false)} />
                </Elements>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

orderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default orderShow;
