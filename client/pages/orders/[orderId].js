import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import Router from "next/router";

// Load your Stripe publishable key
const stripePromise = loadStripe("pk_test_51RjdOAR8IQhpv1s7zQXqtCsrov6HX9LDhhFxl8eImrS0K9Dy8PTP9pzuMGM1gRbuk2NsdBPw1xz0angK13WOtdW900uw17f0Ks");

// Payment form inside modal
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
        token: token.id, // ✅ Send token to backend
      });

      setSuccess(true);
      setTimeout(close, 1500); // Close modal after success
      Router.push("/orders"); // Redirect to orders page
    } catch (err) {
      setError("Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <CardElement options={{ hidePostalCode: true }} />
      <button type="submit" disabled={!stripe || loading} style={{ marginTop: '1rem' }}>
        {loading ? "Processing..." : "Pay"}
      </button>
      {error && <div style={{ color: "red", marginTop: '0.5rem' }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: '0.5rem' }}>Payment successful!</div>}
    </form>
  );
};

// Main component
const orderShow = ({ order, currentUser }) => {
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

  if (timeLeft < 0) {
    return <div>Order has expired.</div>;
  }

  return (
    <div>
      <h2>Time left to pay: {timeLeft} seconds</h2>
      <p>Price: ${order.ticket.price}</p>
      <button onClick={() => setOpenDialog(true)}>Pay Now</button>

      {openDialog && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setOpenDialog(false)} style={closeBtnStyle}>×</button>
            <Elements stripe={stripePromise}>
              <PaymentForm order={order} close={() => setOpenDialog(false)} />
            </Elements>
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

// Minimal modal styles
const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90%",
  position: "relative",
};

const closeBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "15px",
  fontSize: "1.5rem",
  background: "none",
  border: "none",
  cursor: "pointer",
};
