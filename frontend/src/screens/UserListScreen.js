// Import necessary libraries and components
import axios from 'axios'; // For making HTTP requests
import React, { useContext, useEffect, useReducer } from 'react'; // React components and hooks
import Button from 'react-bootstrap/Button'; // Button component from Bootstrap
import { Helmet } from 'react-helmet-async'; // For managing document head and titles
import { useNavigate } from 'react-router-dom'; // For handling routing in a React application
import { toast } from 'react-toastify'; // For displaying toast notifications
import LoadingBox from '../components/LoadingBox'; // Custom loading spinner component
import MessageBox from '../components/MessageBox'; // Custom message box component
import { Store } from '../Store'; // Import the Store context
import { getError } from '../utils'; // Utility function to extract error messages
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Icons from Font Awesome
import { faEdit, faFilePdf, faTrash } from '@fortawesome/free-solid-svg-icons'; // Specific icons used in the UI

// Define a reducer function to manage state updates
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

// Define the UserListScreen component
export default function UserListScreen() {
  // Access the routing function from the router
  const navigate = useNavigate();

  // Initialize the component state using the reducer
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  // Access the global state from the Store context
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Use the useEffect hook to fetch user data when the component mounts or 'successDelete' changes
  useEffect(() => {
    // Define a function to fetch user data
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        // Send a GET request to retrieve user data
        const { data } = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Update component state with fetched user data
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // Handle errors and update the state accordingly
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    // If a user was deleted successfully, reset the 'successDelete' flag, else fetch user data
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  // Handle the deletion of a user
  const deleteHandler = async (user) => {
    // Confirm user's intent to delete
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });

        // Send a DELETE request to delete the user
        await axios.delete(`/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Display a success toast message
        toast.success('User deleted successfully');

        // Update the state to indicate successful deletion
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (error) {
        // Display an error toast message and update the state
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  // Handle viewing user details in a PDF format
  const viewUserDetailsPdfHandler = async (user) => {
    // Send a request to the backend to generate and return the PDF
    try {
      const response = await axios.get(`/api/users/${user._id}/report`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: 'blob', // Tell Axios to expect a binary response
      });

      // Create a Blob object from the response data
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      // Create a URL for the Blob
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open the PDF in a new tab
      window.open(pdfUrl, '_blank');
    } catch (err) {
      // Display an error toast message
      toast.error(getError(err));
    }
  };

  // Render the UserListScreen component
  return (
    <div>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <h1>Users</h1>

      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>IS ADMIN</th>
              <th>IS SUPPLIER</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? 'YES' : 'NO'}</td>
                <td>{user.isSupplier ? 'YES' : 'NO'}</td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(user)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => viewUserDetailsPdfHandler(user)}
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
