import React from 'react';
import Row from 'react-bootstrap/Row'; // Importing Bootstrap components for layout
import Col from 'react-bootstrap/Col';

export default function CheckOutSteps(props) {
  return (
    <Row className="checkout-steps">
      {' '}
      {/* Container for checkout steps */}
      {/* Col 1: Sign-In Step */}
      <Col className={props.step1 ? 'active' : ''}>
        Sign-In{' '}
        {/* Render "Sign-In" step with 'active' class if 'step1' is true */}
      </Col>
      {/* Col 2: Shipping Step */}
      <Col className={props.step2 ? 'active' : ''}>
        Shipping{' '}
        {/* Render "Shipping" step with 'active' class if 'step2' is true */}
      </Col>
      {/* Col 3: Payment Step */}
      <Col className={props.step3 ? 'active' : ''}>
        Payment{' '}
        {/* Render "Payment" step with 'active' class if 'step3' is true */}
      </Col>
      {/* Col 4: Place Order Step */}
      <Col className={props.step4 ? 'active' : ''}>
        Place Order{' '}
        {/* Render "Place Order" step with 'active' class if 'step4' is true */}
      </Col>
    </Row>
  );
}
