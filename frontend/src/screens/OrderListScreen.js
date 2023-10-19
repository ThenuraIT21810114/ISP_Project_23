import axios from 'axios'; // Import Axios for making HTTP requests
import React, { useContext, useEffect, useReducer } from 'react'; // Import React and related hooks
import { toast } from 'react-toastify'; // Import toast notifications
import Button from 'react-bootstrap/Button'; // Import a Bootstrap Button component
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import LoadingBox from '../components/LoadingBox'; // Import a loading component
import MessageBox from '../components/MessageBox'; // Import a message box component
import { Store } from '../Store'; // Import a Store component for global state management
import { getError } from '../utils'; // Import a utility function
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import {
  faInfoCircle,
  faTrash,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons'; // Import FontAwesome icons

// Reducer function for managing state
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }; // Indicate a loading state
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      }; // Set orders and indicate a successful fetch
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }; // Indicate a fetch failure with an error message
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false }; // Indicate a delete request and reset success flag
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      }; // Indicate a successful delete
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false }; // Indicate a delete failure
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false }; // Reset delete status
    default:
      return state;
  }
};

// Component for handling the order list screen
export default function OrderListScreen() {
  const navigate = useNavigate(); // Initialize a navigation function
  const { state } = useContext(Store); // Access global state
  const { userInfo } = state; // Destructure user info from the global state
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  // Use useEffect to fetch the list of orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data }); // Indicate a successful fetch with data
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err), // Indicate a fetch failure with an error message
        });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' }); // Reset delete status
    } else {
      fetchData(); // Fetch data if no recent successful delete
    }
  }, [userInfo, successDelete]);

  // Function to delete an order
  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' }); // Indicate a delete request
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Order deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' }); // Indicate a successful delete
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  // Function to view the PDF of an order
  const viewPdfHandler = async (order) => {
    // Send a request to the backend to generate and return the PDF
    try {
      const response = await axios.get(`/api/orders/${order._id}/pdf`, {
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
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Orders</title> {/* Set the title in the document head */}
      </Helmet>
      <h1>Orders</h1> {/* Render the "Orders" title */}
      {loadingDelete && <LoadingBox></LoadingBox>}{' '}
      {/* Show loading box when deleting */}
      {loading /* Show loading box when fetching orders */ ? (
        <LoadingBox></LoadingBox>
      ) : error /* Show error message if there's an error */ ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          {' '}
          {/* Display a table with order information */}
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>{' '}
                {/* Show user name or "DELETED USER" */}
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'No'}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />{' '}
                    {/* Button to view order details */}
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(order)}
                  >
                    <FontAwesomeIcon icon={faTrash} />{' '}
                    {/* Button to delete the order */}
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => viewPdfHandler(order)}
                  >
                    <FontAwesomeIcon icon={faFilePdf} />{' '}
                    {/* Button to view order PDF */}
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
