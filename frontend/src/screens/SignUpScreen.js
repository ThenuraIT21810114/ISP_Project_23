// Import necessary libraries and components
import Axios from 'axios'; // For making HTTP requests
import { Link, useLocation, useNavigate } from 'react-router-dom'; // For handling routing in a React application
import Container from 'react-bootstrap/Container'; // Container component from the Bootstrap framework
import Form from 'react-bootstrap/Form'; // Form component from Bootstrap
import Button from 'react-bootstrap/Button'; // Button component from Bootstrap
import { Helmet } from 'react-helmet-async'; // For managing document head and titles
import { useContext, useEffect, useState } from 'react'; // React hooks for managing state and side effects
import { Store } from '../Store'; // Import the Store context
import { toast } from 'react-toastify'; // For displaying toast notifications
import { getError } from '../utils'; // Utility function to extract error messages

// Define the SignupScreen component
export default function SignupScreen() {
  // Use the useNavigate hook to get access to the routing function
  const navigate = useNavigate();

  // Use the useLocation hook to get information about the current URL location
  const { search } = useLocation();

  // Parse the 'redirect' parameter from the URL query string, which is used for redirection after signup
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  // Define state variables for user input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Access the global state and dispatch function from the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);

  // Extract the 'userInfo' object from the global state
  const { userInfo } = state;

  // Handle form submission
  const submitHandler = async (e) => {
    e.preventDefault();

    // Check if the entered passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Send a POST request to the server to create a new user
      const { data } = await Axios.post('/api/users/signup', {
        name,
        email,
        password,
      });

      // Dispatch an action to update the global state with the user information
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });

      // Store the user information in local storage
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Redirect the user to the specified 'redirect' URL or the default '/'
      navigate(redirect || '/');
    } catch (err) {
      // Display an error toast with the error message
      toast.error(getError(err));
    }
  };

  // Use the useEffect hook to automatically redirect the user if they are already signed in
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Render the SignupScreen component
  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
        </div>
      </Form>
    </Container>
  );
}
