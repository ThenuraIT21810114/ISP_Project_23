import axios from 'axios'; // Import Axios for making HTTP requests
import { useEffect, useReducer } from 'react'; // Import React hooks for managing state and side effects
import logger from 'use-reducer-logger'; // Import logger middleware for debugging state changes
import Row from 'react-bootstrap/Row'; // Import a Bootstrap Row component
import Col from 'react-bootstrap/Col'; // Import a Bootstrap Col component
import Product from '../components/Product'; // Import a custom Product component
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import LoadingBox from '../components/LoadingBox'; // Import a loading component
import MessageBox from '../components/MessageBox'; // Import a message box component
import { Carousel } from 'react-responsive-carousel'; // Import the Carousel component
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import styles for the Carousel

// Reducer function for managing state
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }; // Indicate a loading state
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false }; // Set products and indicate a successful fetch
    case 'FETCH_FAIL':
      return { ...state, loading: false, Error: action.payload }; // Indicate a fetch failure with an error message
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, Error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    Error: '',
  }); // Use the reducer to manage the component's state

  // Use useEffect to fetch product data from the server
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' }); // Indicate a loading state
      try {
        const result = await axios.get('/api/products'); // Fetch product data
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data }); // Indicate a successful fetch with data
      } catch (Error) {
        dispatch({ type: 'FETCH_FAIL', payload: Error.message }); // Indicate a fetch failure with an error message
      }
    };
    fetchData(); // Execute the fetchData function when the component mounts
  }, []);

  return (
    <div>
      <Helmet>
        <title>GARA FASHION</title> {/* Set the title in the document head */}
      </Helmet>
      {/* Slideshow */}
      <div className="slideshow-container">
        <Carousel autoPlay infiniteLoop>
          {' '}
          {/* Render a carousel component */}
          <div>
            <img src="/images/slideshowimg1.png" alt="Slide 1" />
          </div>
          <div>
            <img src="/images/slideshowimg2.png" alt="Slide 2" />
          </div>
          <div>
            <img src="/images/slideshowimg3.png" alt="Slide 3" />
          </div>
          {/* Add more slides as needed */}
        </Carousel>
      </div>
      <h1 className="header1">
        <center>Featured Products</center>
      </h1>
      <div className="products">
        {loading ? ( // Display a loading component if data is loading
          <LoadingBox />
        ) : Error ? ( // Display an error message if there's an error
          <MessageBox variant="danger">{Error}</MessageBox>
        ) : (
          <Row>
            {' '}
            {/* Render product cards if no loading or error */}
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>{' '}
                {/* Render a product card component */}
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
