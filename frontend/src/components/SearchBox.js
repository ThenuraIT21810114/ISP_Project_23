import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
  const navigate = useNavigate(); // A hook from React Router for navigation
  const [query, setQuery] = useState(''); // State to manage the search query

  // Handler for submitting the search form
  const submitHandler = (e) => {
    e.preventDefault(); // Prevent the default form submission
    navigate(query ? `/search/?query=${query}` : '/search'); // Navigate to the search results page with the query as a URL parameter
  };

  return (
    <Form className="d-flex me-auto" onSubmit={submitHandler}>
      <InputGroup>
        <FormControl
          type="text"
          name="q"
          id="q"
          onChange={(e) => setQuery(e.target.value)} // Update the query state as the user types
          placeholder="Search products..."
          aria-label="Search Products"
          aria-describedby="button-search"
        ></FormControl>
        <Button variant="outline-primary" type="submit" id="button-search">
          <i className="fas fa-search"></i> {/* Render a search icon */}
        </Button>
      </InputGroup>
    </Form>
  );
}
