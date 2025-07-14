import { useState } from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const NewTicket = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price
    },
    onSuccess: () => {
      setTitle("");
      setPrice("");
      Router.push("/");
    }
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) return setPrice("");
    setPrice(value.toFixed(2));
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="mb-4 text-center">Create a New Ticket</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="form-control"
              placeholder="Enter ticket title"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              value={price}
              onBlur={onBlur}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              placeholder="Enter price in USD"
              required
            />
          </div>

          {errors && <div className="alert alert-danger">{errors}</div>}

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
