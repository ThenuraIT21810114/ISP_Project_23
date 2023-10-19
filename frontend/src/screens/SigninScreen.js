import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SigninScreen() {
  const navigate = useNavigate(); // Get a function for programmatic navigation
  const { search } = useLocation(); // Access the current URL location
  const redirectInUrl = new URLSearchParams(search).get('redirect'); // Extract 'redirect' parameter from URL
  const redirect = redirectInUrl ? redirectInUrl : '/'; // Determine the redirect URL based on the parameter

  const [email, setEmail] = useState(''); // Initialize local state variables for email and password
  const [password, setPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store); // Access the global state and dispatch function
  const { userInfo } = state; // Destructure the user information from the global state

  const submitHandler = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      const { data } = await Axios.post('/api/users/signin', {
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data }); // Dispatch an action to update user information
      localStorage.setItem('userInfo', JSON.stringify(data)); // Store user information in local storage
      navigate(redirect || '/'); // Navigate to the specified or default URL
    } catch (err) {
      toast.error(getError(err)); // Display an error message using Toastify
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect); // Automatically redirect if the user is already signed in
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <h1 className="my-3">Sign In</h1> {/* Display the page title */}
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label> {/* Form input for email */}
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label> {/* Form input for password */}
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign In</Button>{' '}
          {/* Submit button for signing in */}
        </div>
        <div className="mb-3">
          New customer?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>{' '}
          {/* Link to the sign-up page */}
        </div>
        <div className="mb-3">
          Forget Password? <Link to={`/forget-password`}>Reset Password</Link>{' '}
          {/* Link to the password reset page */}
        </div>
      </Form>
    </Container>
  );
}
