import React, { useContext, useReducer, useState } from 'react'; // Import React hooks
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import Form from 'react-bootstrap/Form'; // Import Bootstrap Form component
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button component
import { Store } from '../Store'; // Import a Store component for global state management
import { toast } from 'react-toastify'; // Import toast for displaying notifications
import { getError } from '../utils'; // Import a utility function for handling errors
import axios from 'axios'; // Import Axios for making HTTP requests

// Reducer function for managing state updates
const reducer = (state, action) => {
  switch (action.type) {
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

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store); // Get user information from global state
  const { userInfo } = state; // Destructure user information
  const [name, setName] = useState(userInfo.name); // Set initial name state with user's name
  const [email, setEmail] = useState(userInfo.email); // Set initial email state with user's email
  const [password, setPassword] = useState(''); // Initialize password state
  const [, setConfirmPassword] = useState(''); // Initialize confirm password state (not used)

  const [, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  // Function to handle form submission for updating user profile
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('User updated successfully');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className="my-3">User Profile</h1>
      <form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  );
}
