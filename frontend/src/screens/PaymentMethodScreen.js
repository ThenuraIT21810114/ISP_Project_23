import React, { useContext, useEffect, useState } from 'react'; // Import React and related hooks
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import Form from 'react-bootstrap/Form'; // Import Bootstrap Form component
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button component
import CheckOutSteps from '../components/CheckOutSteps'; // Import a custom Checkout Steps component
import { Store } from '../Store'; // Import a Store component for global state management

// Component for handling payment method selection
export default function PaymentMethodScreen() {
  const navigate = useNavigate(); // Initialize a navigation function
  const { state, dispatch: ctxDispatch } = useContext(Store); // Access global state and dispatch function
  const {
    cart: { shippingAddress, paymentMethod }, // Destructure shipping address and payment method from the state
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'Card Payments'
  ); // Use state to manage the selected payment method

  // Use useEffect to check if the shipping address is set, and redirect if not
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  // Function to handle form submission
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName }); // Dispatch an action to save the selected payment method
    localStorage.setItem('paymentMethod', paymentMethodName); // Store the payment method in local storage
    navigate('/placeorder'); // Navigate to the place order screen
  };

  return (
    <div>
      <CheckOutSteps step1 step2 step3></CheckOutSteps>{' '}
      {/* Render the checkout steps component */}
      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className="my-3">Payment Method</h1> {/* Render the page title */}
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="Card Payments"
              label="Card Payments"
              value="Card Payments"
              checked={paymentMethodName === 'Card Payments'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Form.Check
              type="radio"
              id="Cash On Delivery"
              label="Cash On Delivery"
              value="Cash On Delivery"
              checked={paymentMethodName === 'Cash On Delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Button type="submit">Continue</Button>{' '}
            {/* Render a button to continue to the next step */}
          </div>
        </Form>
      </div>
    </div>
  );
}
