import React, { useContext, useEffect, useReducer, useState } from 'react'; // Import React and related hooks
import { useNavigate, useParams } from 'react-router-dom'; // Import routing related hooks
import { toast } from 'react-toastify'; // Import toast for displaying notifications
import axios from 'axios'; // Import Axios for making HTTP requests
import { Store } from '../Store'; // Import a Store component for global state management
import { getError } from '../utils'; // Import a utility function for handling errors
import Container from 'react-bootstrap/Container'; // Import Bootstrap Container component
import ListGroup from 'react-bootstrap/ListGroup'; // Import Bootstrap ListGroup component
import Form from 'react-bootstrap/Form'; // Import Bootstrap Form component
import { Helmet } from 'react-helmet-async'; // Import Helmet for managing document head changes
import LoadingBox from '../components/LoadingBox'; // Import a custom Loading Box component
import MessageBox from '../components/MessageBox'; // Import a custom Message Box component
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button component

const reducer = (state, action) => {
  // Reducer function for managing state updates
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};

// Component for editing a product
export default function ProductEditScreen() {
  const navigate = useNavigate(); // Initialize a navigation function
  const params = useParams(); // Get parameters from the URL
  const { id: productId } = params; // Destructure the product ID from the parameters

  const { state } = useContext(Store); // Access global state
  const { userInfo } = state; // Destructure user information from the state
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      Images: [],
    });

  const [name, setName] = useState(''); // Initialize state for the product name
  const [slug, setSlug] = useState(''); // Initialize state for the product slug
  const [price, setPrice] = useState(''); // Initialize state for the product price
  const [Image, setImage] = useState(''); // Initialize state for the product image
  const [Images, setImages] = useState([]); // Initialize state for additional product images
  const [category, setCategory] = useState(''); // Initialize state for the product category
  const [countInStock, setCountInStock] = useState(''); // Initialize state for the product stock count
  const [Material, setMaterial] = useState(''); // Initialize state for the product material
  const [description, setDescription] = useState(''); // Initialize state for the product description

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/products/${productId}`); // Fetch product details by ID
        // Update the component's state with the fetched product data
        setName(data.name);
        setSlug(data.slug);
        setPrice(data.price);
        setImage(data.Image);
        setImages(data.Images || []);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setMaterial(data.Material);
        setDescription(data.description);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [productId]);

  // Function to handle the form submission when updating a product
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/products/${productId}`,
        {
          _id: productId,
          name,
          slug,
          price,
          Image,
          Images,
          category,
          Material,
          countInStock,
          description,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      ); // Send a request to update the product
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  // Function to handle the file upload
  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      }); // Send a request to upload the file
      dispatch({ type: 'UPLOAD_SUCCESS' });

      if (forImages) {
        setImages([...Images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success('Image uploaded successfully. Click Update to apply it');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };

  // Function to handle deleting a file
  const deleteFileHandler = async (fileName) => {
    setImages(Images.filter((x) => x !== fileName)); // Remove the image file from the list of additional images
    toast.success('Image removed successfully. Click Update to apply it');
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit Product ${productId}</title>
      </Helmet>
      <h1>Edit Product {productId}</h1>

      {loading ? (
        <LoadingBox></LoadingBox> // Display a loading indicator
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox> // Display an error message if there's an error
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="slug">
            <Form.Label>Slug</Form.Label>
            <Form.Control
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Price</Form.Label>
            <Form.Control
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image File</Form.Label>
            <Form.Control
              value={Image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="imageFile">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="additionalImage">
            <Form.Label>Additional Images</Form.Label>
            {Images.length === 0 ? (
              <MessageBox>No image</MessageBox>
            ) : (
              <ListGroup variant="flush">
                {Images.map((x) => (
                  <ListGroup.Item key={x}>
                    {x}
                    <Button
                      variant="light"
                      onClick={() => deleteFileHandler(x)}
                    >
                      <i className="fa fa-times-circle"></i>{' '}
                      {/* Button to remove an additional image */}
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="additionalImageFile">
            <Form.Label>Upload Additional Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => uploadFileHandler(e, true)}
            />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="Material">
            <Form.Label>Material</Form.Label>
            <Form.Control
              value={Material}
              onChange={(e) => setMaterial(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="countInStock">
            <Form.Label>Count In Stock</Form.Label>
            <Form.Control
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}{' '}
            {/* Display a loading indicator while updating */}
          </div>
        </Form>
      )}
    </Container>
  );
}
