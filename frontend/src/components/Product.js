import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import CardBody from 'react-bootstrap/esm/CardBody';
import Rating from './Rating';

function Product(props) {
  const { product } = props;
  return (
    <Card>
      <Link to={`/product/${product.slug}`}>
        <img src={product.Image} className="card-img-top" alt={product.name} />
      </Link>
      <CardBody>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>LKR{product.price}</Card.Text>
        <Button>Add to cart</Button>
      </CardBody>
    </Card>
  );
}
export default Product;
