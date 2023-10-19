// Import the 'mongoose' library to work with MongoDB.
import mongoose from 'mongoose';

// Define a schema for an 'order' using Mongoose.
const orderSchema = new mongoose.Schema(
  {
    // Define the 'orderItems' field as an array of objects.
    orderItems: [
      {
        slug: { type: String, required: true }, // Unique identifier for the product.
        name: { type: String, required: true }, // Name of the product.
        quantity: { type: Number, required: true }, // Number of items ordered.
        Image: { type: String, required: true }, // Image URL of the product.
        price: { type: Number, required: true }, // Price of the product.
        product: {
          type: mongoose.Schema.Types.ObjectId, // Reference to the 'Product' model.
          ref: 'Product',
          required: true,
        },
      },
    ],
    // Define the 'shippingAddress' field as an object with subfields.
    shippingAddress: {
      fullName: { type: String, required: true }, // Full name of the recipient.
      address: { type: String, required: true }, // Shipping address.
      city: { type: String, required: true }, // City of the recipient.
      postalCode: { type: String, required: true }, // Postal code of the shipping address.
      country: { type: String, required: true }, // Country of the shipping address.
      location: {
        lat: Number, // Latitude of the shipping address (optional).
        lng: Number, // Longitude of the shipping address (optional).
        address: String, // Address details (optional).
        name: String, // Name of the location (optional).
        vicinity: String, // Vicinity details (optional).
        googleAddressId: String, // Google address identifier (optional).
      },
    },
    // Define the 'paymentMethod' field as a string indicating the payment method.
    paymentMethod: { type: String, required: true },
    // Define the 'paymentResult' field as an object with payment details.
    paymentResult: {
      id: String, // Payment ID (optional).
      status: String, // Payment status (optional).
      update_time: String, // Time of payment update (optional).
      email_address: String, // Email address associated with the payment (optional).
    },
    // Define fields for the pricing of the order.
    itemsPrice: { type: Number, required: true }, // Total price of items.
    shippingPrice: { type: Number, required: true }, // Shipping cost.
    taxPrice: { type: Number, required: true }, // Tax amount.
    totalPrice: { type: Number, required: true }, // Total order price.

    // Define the 'user' field as a reference to the 'User' model.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Fields related to payment and delivery status.
    isPaid: { type: Boolean, default: false }, // Indicates if the order is paid.
    paidAt: { type: Date }, // Date and time of payment.
    isDelivered: { type: Boolean, default: false }, // Indicates if the order is delivered.
    deliveredAt: { type: Date }, // Date and time of delivery.
  },
  {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' timestamps.
  }
);

// Create a Mongoose model named 'Order' based on the defined schema.
const Order = mongoose.model('Order', orderSchema);

// Export the 'Order' model for use in other parts of the application.
export default Order;
