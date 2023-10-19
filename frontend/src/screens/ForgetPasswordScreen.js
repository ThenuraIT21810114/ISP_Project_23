import Axios from 'axios'; // Import Axios for making HTTP requests
import { useContext, useEffect, useState } from 'react'; // Import React hooks
import Container from 'react-bootstrap/Container'; // Import a Bootstrap Container component
import Button from 'react-bootstrap/Button'; // Import a Bootstrap Button component
import Form from 'react-bootstrap/Form'; // Import a Bootstrap Form component
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import { toast } from 'react-toastify'; // Import toast notifications
import { Store } from '../Store'; // Import a Store component for global state
import { getError } from '../utils'; // Import a utility function

// Component for handling the "Forget Password" screen
export default function ForgetPasswordScreen() {
  const navigate = useNavigate(); // Initialize a navigation function

  const [email, setEmail] = useState(''); // Initialize a state variable for email input

  const { state } = useContext(Store); // Access global state
  const { userInfo } = state; // Destructure user info from the global state

  // Use useEffect to check if the user is already logged in, and if so, navigate to the home page
  useEffect(() => {
    if (userInfo) {
      navigate('/'); // Navigate to the home page if the user is logged in
    }
  }, [navigate, userInfo]);

  // Function to handle form submission
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const { data } = await Axios.post('/api/users/forget-password', {
        email, // Send a POST request to reset the user's password
      });
      toast.success(data.message); // Display a success toast message
    } catch (err) {
      toast.error(getError(err)); // Display an error toast message with the error details
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Forget Password</title>{' '}
        {/* Set the title in the document head */}
      </Helmet>
      <h1 className="my-3">Forget Password</h1>{' '}
      {/* Render the "Forget Password" title */}
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />{' '}
          {/* Render an email input field */}
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">submit</Button> {/* Render a submit button */}
        </div>
      </Form>
    </Container>
  );
}
