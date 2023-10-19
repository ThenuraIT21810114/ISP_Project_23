import axios from 'axios'; // Import Axios for making HTTP requests
import { useContext, useEffect, useReducer, useRef, useState } from 'react'; // Import React-related hooks
import { Link, useNavigate, useParams } from 'react-router-dom'; // Import routing-related hooks
import Row from 'react-bootstrap/Row'; // Import Bootstrap Row component
import Col from 'react-bootstrap/Col'; // Import Bootstrap Col component
import ListGroup from 'react-bootstrap/ListGroup'; // Import Bootstrap ListGroup component
import Rating from '../components/Rating'; // Import a custom Rating component
import Card from 'react-bootstrap/Card'; // Import Bootstrap Card component
import Badge from 'react-bootstrap/Badge'; // Import Bootstrap Badge component
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button component
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import LoadingBox from '../components/LoadingBox'; // Import a custom Loading Box component
import MessageBox from '../components/MessageBox'; // Import a custom Message Box component
import { getError } from '../utils'; // Import a utility function for handling errors
import { Store } from '../Store'; // Import a Store component for global state management
import { toast } from 'react-toastify'; // Import toast for displaying notifications
import FloatingLabel from 'react-bootstrap/FloatingLabel'; // Import Bootstrap FloatingLabel component
import Form from 'react-bootstrap/Form'; // Import Bootstrap Form component

// Reducer function for managing state updates
const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, Error: action.payload };
    default:
      return state;
  }
};

function ProductScreen() {
  let reviewsRef = useRef(); // Create a ref for reviews section

  const [rating, setRating] = useState(0); // Set initial rating state
  const [comment, setComment] = useState(''); // Set initial comment state
  const [selectedImage, setSelectedImage] = useState(''); // Set initial selected image state

  const Params = useParams(); // Get URL parameters
  const { slug } = Params; // Destructure the 'slug' parameter
  const navigate = useNavigate(); // Initialize a navigation function

  const [{ loading, Error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: {
        Images: [], // Initialize Images as an empty array
      },
      loading: true,
      Error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        const updatedProduct = {
          ...result.data,
          Images: result.data.Images || [], // Ensure Images is an array
        };
        dispatch({ type: 'FETCH_SUCCESS', payload: updatedProduct });
      } catch (Error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(Error) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  // Function to add a product to the cart
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };

  // Function to handle form submission for creating a review
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter a comment and rating');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: 'CREATE_SUCCESS',
      });
      toast.success('Review submitted successfully');
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });

      // Scroll to the reviews section
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };

  return loading ? ( // If data is still loading
    <LoadingBox />
  ) : Error ? ( // If there is an error
    <MessageBox variant="danger">{Error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={6}>
          <img
            className="img-large"
            src={selectedImage || product.Image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>Price: LKR{product.price}</ListGroup.Item>
            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {Array.isArray(product.Images) &&
                  product.Images.map((x) => (
                    <Col key={x}>
                      <Card>
                        <Button
                          className="thumbnail"
                          type="button"
                          variant="light"
                          onClick={() => setSelectedImage(x)}
                        >
                          <Card.Img variant="top" src={x} alt="product" />
                        </Button>
                      </Card>
                    </Col>
                  ))}
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              Description:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>LKR{product.price}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Out of Stock</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={addToCartHandler} variant="primary">
                        Add to Cart
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="my-3">
        <h2 ref={reviewsRef}>Reviews</h2>
        <div className="mb-3">
          {product.reviews?.length === 0 && (
            <MessageBox>There are no reviews</MessageBox>
          )}
        </div>
        <ListGroup>
          {product.reviews &&
            product.reviews.map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating rating={review.rating} caption=" "></Rating>
                <p>{review.createdAt.substring(0, 10)}</p>
                <p>{review.comment}</p>
              </ListGroup.Item>
            ))}
        </ListGroup>
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Write a customer review</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very good</option>
                  <option value="5">5 - Excellent</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controlId="floatingTextarea"
                label="Comments"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Leave a comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FloatingLabel>
              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Submit
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              Please{' '}
              <Link to={`/signin?redirect=/product/${product.slug}`}>
                Sign In
              </Link>{' '}
              to write a review
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductScreen;
