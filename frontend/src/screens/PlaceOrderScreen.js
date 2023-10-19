import Axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'; // Import React and related hooks
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import Row from 'react-bootstrap/Row'; // Import Bootstrap Row component
import Col from 'react-bootstrap/Col'; // Import Bootstrap Col component
import Card from 'react-bootstrap/Card'; // Import Bootstrap Card component
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button component
import ListGroup from 'react-bootstrap/ListGroup'; // Import Bootstrap ListGroup component
import { toast } from 'react-toastify'; // Import toast for displaying notifications
import { getError } from '../utils'; // Import a utility function for handling errors
import { Store } from '../Store'; // Import a Store component for global state management
import CheckOutSteps from '../components/CheckOutSteps'; // Import a custom Checkout Steps component
import LoadingBox from '../components/LoadingBox'; // Import a custom Loading Box component

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

// Component for placing an order
export default function PlaceOrderScreen() {
  const navigate = useNavigate(); // Initialize a navigation function

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store); // Access global state and dispatch function
  const { cart, userInfo } = state; // Destructure cart and user information from the state

  // Calculate the Tax Rate & Shipping Price
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // Function to round a number to two decimal places
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  ); // Calculate the total price of items in the cart
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10); // Determine the shipping price
  cart.taxPrice = round2(0.15 * cart.itemsPrice); // Calculate the tax price
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice; // Calculate the total price

  // Function to handle placing an order
  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      ); // Send a request to create an order

      ctxDispatch({ type: 'CART_CLEAR' }); // Clear the shopping cart in the global state
      dispatch({ type: 'CREATE_SUCCESS' }); // Set success state
      localStorage.removeItem('cartItems'); // Remove cart items from local storage
      navigate(`/order/${data.order._id}`); // Navigate to the order confirmation page
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' }); // Set failure state
      toast.error(getError(err)); // Display an error notification
    }
  };

  // Use useEffect to check if payment method is set, and redirect if not
  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckOutSteps step1 step2 step3 step4></CheckOutSteps>{' '}
      {/* Render the checkout steps component */}
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className="my-3">Preview Order</h1> {/* Render the page title */}
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Address: </strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Edit</Link>{' '}
              {/* Provide an option to edit shipping details */}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>{' '}
              {/* Provide an option to edit payment method */}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.Image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>LKR {item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Edit</Link>{' '}
              {/* Provide an option to edit the cart */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>LKR {cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>LKR {cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>LKR {cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>LKR {cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>{' '}
                    {/* Render a button to place the order */}
                  </div>
                  {loading && <LoadingBox></LoadingBox>}{' '}
                  {/* Show a loading indicator */}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
