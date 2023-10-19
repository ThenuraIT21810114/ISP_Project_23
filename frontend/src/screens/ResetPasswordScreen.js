import Axios from 'axios'; // Import Axios for making HTTP requests
import { useContext, useEffect, useState } from 'react'; // Import React hooks
import Container from 'react-bootstrap/Container'; // Import Bootstrap Container component
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button component
import Form from 'react-bootstrap/Form'; // Import Bootstrap Form component
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import { useNavigate, useParams } from 'react-router-dom'; // Import hooks for routing and URL parameters
import { toast } from 'react-toastify'; // Import toast for displaying notifications
import { Store } from '../Store'; // Import a Store component for global state management
import { getError } from '../utils'; // Import a utility function for handling errors

// Define the ResetPasswordScreen component
export default function ResetPasswordScreen() {
  const navigate = useNavigate(); // Get a function for programmatic navigation
  const { token } = useParams(); // Get the token parameter from the URL

  const [password, setPassword] = useState(''); // Initialize the password state
  const [confirmPassword, setConfirmPassword] = useState(''); // Initialize the confirm password state

  const { state } = useContext(Store); // Get the global state
  const { userInfo } = state; // Destructure user information from the global state

  // Check if the user is already signed in or if the token is not provided
  useEffect(() => {
    if (userInfo || !token) {
      navigate('/'); // Redirect to the home page if the user is signed in or the token is missing
    }
  }, [navigate, userInfo, token]);

  // Function to handle form submission for resetting the password
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await Axios.post('/api/users/reset-password', {
        password,
        token,
      });
      navigate('/signin'); // Redirect to the sign-in page after a successful password reset
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(getError(err)); // Display an error message if the password reset fails
    }
  };

  // Render the ResetPasswordScreen component
  return (
    <Container className="small-container">
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <h1 className="my-3">Reset Password</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Reset Password</Button>
        </div>
      </Form>
    </Container>
  );
}
