import axios from 'axios';
import { useEffect, useReducer } from 'react';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Carousel } from 'react-responsive-carousel'; // Import the Carousel component
import 'react-responsive-carousel/lib/styles/carousel.min.css';
//import data from '../data';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, Error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, Error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    Error: '',
  });
  //const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (Error) {
        dispatch({ type: 'FETCH_FAIL', payload: Error.message });
      }

      //setProducts(result.data);
    };
    fetchData();
  }, []);
  return (
    <div>
      <Helmet>
        <title>GARA FASHION</title>
      </Helmet>
      {/* Slideshow */}
      <div className="slideshow-container">
        <Carousel autoPlay infiniteLoop>
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
        {loading ? (
          <LoadingBox />
        ) : Error ? (
          <MessageBox variant="danger">{Error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
