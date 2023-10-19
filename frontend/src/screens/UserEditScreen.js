// Import necessary libraries and components
import axios from 'axios'; // For making HTTP requests
import React, { useContext, useEffect, useReducer, useState } from 'react'; // React components and hooks
import Form from 'react-bootstrap/Form'; // Form component from Bootstrap
import Button from 'react-bootstrap/Button'; // Button component from Bootstrap
import Container from 'react-bootstrap/Container'; // Container component from Bootstrap
import { Helmet } from 'react-helmet-async'; // For managing document head and titles
import { useNavigate, useParams } from 'react-router-dom'; // For handling routing in a React application
import { toast } from 'react-toastify'; // For displaying toast notifications
import LoadingBox from '../components/LoadingBox'; // Custom loading spinner component
import MessageBox from '../components/MessageBox'; // Custom message box component
import { Store } from '../Store'; // Import the Store context
import { getError } from '../utils'; // Utility function to extract error messages

// Define a reducer function to manage state updates
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

// Define the UserEditScreen component
export default function UserEditScreen() {
  // Initialize the component state using the reducer
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Access the global state from the Store context
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Get the 'userId' parameter from the URL using the useParams hook
  const params = useParams();
  const { id: userId } = params;

  // Access the routing function from the router
  const navigate = useNavigate();

  // Define state variables to store user data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);

  // Use the useEffect hook to fetch user data when the component mounts
  useEffect(() => {
    // Define a function to fetch user data
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Update component state with fetched user data
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        setIsSupplier(data.isSupplier);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        // Handle errors and update the state accordingly
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    // Call the fetchData function when the component mounts or 'userId' changes
    fetchData();
  }, [userId, userInfo]);

  // Handle the form submission to update user information
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      // Send a PUT request to update user data
      await axios.put(
        `/api/users/${userId}`,
        { _id: userId, name, email, isAdmin, isSupplier },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      // Handle the successful update
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('User updated successfully');

      // Redirect to the user management page
      navigate('/admin/users');
    } catch (error) {
      // Handle update errors and display an error toast
      toast.error(getError(error));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  // Render the UserEditScreen component
  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit User ${userId}</title>
      </Helmet>
      <h1>Edit User {userId}</h1>

      {/* Conditionally render loading spinner, error message, or the user edit form */}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          {/* Checkboxes for isAdmin and isSupplier attributes */}
          <Form.Check
            className="mb-3"
            type="checkbox"
            id="isAdmin"
            label="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <Form.Check
            className="mb-3"
            type="checkbox"
            id="isSupplier"
            label="isSupplier"
            checked={isSupplier}
            onChange={(e) => setIsSupplier(e.target.checked)}
          />

          <div className="mb-3">
            {/* Submit button with loading spinner */}
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
