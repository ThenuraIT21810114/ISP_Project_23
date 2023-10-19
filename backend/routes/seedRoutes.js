// Import necessary dependencies and modules
import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js'; // Import sample data for products and users
import User from '../models/userModel.js';

// Create an Express Router for a seeding (initial data population) route
const seedRouter = express.Router();

// Define a route to seed the database with sample data
seedRouter.get('/', async (req, res) => {
  // Delete all existing products from the database
  await Product.deleteMany();

  // Insert the sample products from the 'data' module into the database
  const createdProducts = await Product.insertMany(data.products);

  // Delete all existing users from the database
  await User.deleteMany();

  // Insert the sample users from the 'data' module into the database
  const createdUsers = await User.insertMany(data.users);

  // Send a response indicating that the seeding process is complete
  res.send({ createdProducts, createdUsers });
});

// Export the seedRouter for use in the application
export default seedRouter;
