// Import the 'mongoose' library to work with MongoDB.
import mongoose from 'mongoose';

// Define a Mongoose schema for user data.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the user.
    email: { type: String, required: true, unique: true }, // User's email (must be unique).
    password: { type: String, required: true }, // User's password (typically hashed).
    resetToken: { type: String }, // Reset token for password recovery (optional).
    isAdmin: { type: Boolean, default: false, required: true }, // Indicates if the user is an admin.
    isSupplier: { type: Boolean, default: false, required: true }, // Indicates if the user is a supplier.
  },
  {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' timestamps.
  }
);

// Create a Mongoose model named 'User' based on the defined schema.
const User = mongoose.model('User', userSchema);

// Export the 'User' model for use in other parts of the application.
export default User;
