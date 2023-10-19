// Import required packages and modules
import express from 'express'; // Express web framework
import mongoose from 'mongoose'; // Mongoose for MongoDB connection
import dotenv from 'dotenv'; // Load environment variables
import seedRouter from './routes/seedRoutes.js'; // Router for seeding data
import productRouter from './routes/productRoutes.js'; // Router for product-related routes
import userRouter from './routes/userRoutes.js'; // Router for user-related routes
import orderRouter from './routes/orderRoutes.js'; // Router for order-related routes
import uploadRouter from './routes/uploadRoutes.js'; // Router for file uploads

dotenv.config(); // Load environment variables from .env file

mongoose
  .connect(process.env.MONGODB_URI) // Connect to the MongoDB database using the URI from environment variables
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express(); // Create an Express application

app.use(express.json()); // Enable JSON parsing for incoming requests
app.use(express.urlencoded({ extended: true })); // Enable parsing of URL-encoded data

// Route to get the PayPal client ID or a default value
app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

// Route to get the Google API key
app.get('/api/keys/google', (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY || '' });
});

// Register the routers for different API routes
app.use('/api/seed', seedRouter); // Seeding data
app.use('/api/products', productRouter); // Product-related routes
app.use('/api/users', userRouter); // User-related routes
app.use('/api/orders', orderRouter); // Order-related routes
app.use('/api/upload', uploadRouter); // File upload routes

// Error handling middleware to handle unexpected errors
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000; // Define the port for the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
