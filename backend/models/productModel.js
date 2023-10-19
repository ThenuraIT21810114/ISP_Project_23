// Import the 'mongoose' library to work with MongoDB.
import mongoose from 'mongoose';

// Define a Mongoose schema for product reviews.
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the reviewer.
    comment: { type: String, required: true }, // Review comment.
    rating: { type: Number, required: true }, // Rating given by the reviewer.
  },
  {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' timestamps.
  }
);

// Define a Mongoose schema for products.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Name of the product (must be unique).
    slug: { type: String, required: true, unique: true }, // Unique identifier for the product.
    Image: { type: String, required: true }, // Image URL of the product.
    Images: { String }, // (Note: This should likely be an array type for multiple images).
    Material: { type: String, required: true }, // Material of the product.
    category: { type: String, required: true }, // Category of the product.
    description: { type: String, required: true }, // Description of the product.
    price: { type: Number, required: true }, // Price of the product.
    countInStock: { type: Number, required: true }, // Number of items in stock.
    rating: { type: Number, required: true }, // Average rating of the product.
    numReviews: { type: Number, required: true }, // Total number of reviews for the product.
    reviews: [reviewSchema], // An array of review objects associated with the product.
  },
  {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' timestamps.
  }
);

// Create a Mongoose model named 'Product' based on the defined schema.
const Product = mongoose.model('Product', productSchema);

// Export the 'Product' model for use in other parts of the application.
export default Product;
