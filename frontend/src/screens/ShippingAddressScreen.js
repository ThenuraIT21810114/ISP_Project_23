import React, { useContext, useEffect, useState } from 'react'; // Import necessary React hooks and components
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import Form from 'react-bootstrap/Form'; // Import Bootstrap components for forms
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; // Import routing-related hook
import { Store } from '../Store'; // Import the application's store context
import CheckOutSteps from '../components/CheckOutSteps'; // Import a custom component

export default function ShippingAddressScreen() {
  const navigate = useNavigate(); // Get a function for programmatic navigation
  const { state, dispatch: ctxDispatch } = useContext(Store); // Access the global state and dispatch function
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state; // Destructure state properties for convenience
  const [fullName, setFullName] = useState(shippingAddress.fullName || ''); // Initialize local state variables for form fields
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping'); // Redirect to the sign-in page if user information is missing
    }
  }, [userInfo, navigate]);

  const [country, setCountry] = useState(shippingAddress.country || ''); // Initialize a state variable for the country field

  const submitHandler = (e) => {
    e.preventDefault(); // Prevent the default form submission
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      })
    );
    navigate('/payment'); // Navigate to the payment page
  };

  useEffect(() => {
    ctxDispatch({ type: 'SET_FULLBOX_OFF' }); // Update the state to turn off "fullBox"
  }, [ctxDispatch, fullBox]);

  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <CheckOutSteps step1 step2></CheckOutSteps>{' '}
      {/* Render a custom checkout steps component */}
      <div className="container small-container">
        <h1 className="my-3">Shipping Address</h1>{' '}
        {/* Display the page title */}
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Full Name</Form.Label> {/* Form input for full name */}
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label> {/* Form input for address */}
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>City</Form.Label> {/* Form input for city */}
            <Form.Control
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>Postal Code</Form.Label>{' '}
            {/* Form input for postal code */}
            <Form.Control
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label> {/* Form input for country */}
            <Form.Control
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button
              id="chooseOnMap"
              type="button"
              variant="light"
              onClick={() => navigate('/map')}
            >
              Choose Location On Map
            </Button>{' '}
            {/* Button to choose location on the map */}
            {shippingAddress.location && shippingAddress.location.lat ? (
              <div>
                LAT: {shippingAddress.location.lat}
                LNG:{shippingAddress.location.lng}
              </div>
            ) : (
              <div>No location</div>
            )}
          </div>

          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continue
            </Button>{' '}
            {/* Submit button to proceed to payment */}
          </div>
        </Form>
      </div>
    </div>
  );
}
