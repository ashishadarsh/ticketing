import { useState } from "react";
import Router from 'next/router';
import useRequest from "../../hooks/use-request";

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {
      email,
      password
    },
    onSuccess: () => Router.push('/')
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="mb-4 text-center">Sign In</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input 
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              className="form-control"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              className="form-control"
              placeholder="Your password"
              required
            />
          </div>
          {errors && <div className="alert alert-danger">{errors}</div>}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
