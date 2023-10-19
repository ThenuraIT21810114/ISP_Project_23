import Card from 'react-bootstrap/Card'; // Importing the Bootstrap Card component
import Button from 'react-bootstrap/Button'; // Importing the Bootstrap Button component
import { Link } from 'react-router-dom'; // Importing the Link component from React Router
import CardBody from 'react-bootstrap/esm/CardBody'; // Importing the Bootstrap CardBody component
import Rating from './Rating'; // Importing a custom Rating component
import axios from 'axios'; // Importing the Axios library for making HTTP requests
import { useContext } from 'react'; // Importing the useContext hook from React
import { Store } from '../Store'; // Importing the Store context

function Product(props) {
  const { product } = props; // Destructuring the 'product' prop

  const { state, dispatch: ctxDispatch } = useContext(Store); // Accessing state and dispatch function from the Store context
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    // Function to handle adding a product to the cart
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  return (
    <Card>
      {/* Rendering a Bootstrap Card */}
      <Link to={`/product/${product.slug}`}>
        {/* Creating a link to the product details page */}
        <img src={product.Image} className="card-img-top" alt={product.name} />
        {/* Displaying the product image with the name as alt text */}
      </Link>
      <CardBody>
        {/* Rendering the CardBody component */}
        <Link to={`/product/${product.slug}`}>
          {/* Creating a link to the product details page */}
          <Card.Title>{product.name}</Card.Title>
          {/* Displaying the product name as the card title */}
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        {/* Using the custom Rating component to display product rating and review count */}
        <Card.Text>LKR{product.price}</Card.Text>
        {/* Displaying the product price */}
        {product.countInStock === 0 ? (
          <Button variant="dark" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
        )}
        {/* Conditional rendering of 'Add to cart' button or 'Out of stock' message */}
      </CardBody>
    </Card>
  );
}

export default Product; // Exporting the Product component
