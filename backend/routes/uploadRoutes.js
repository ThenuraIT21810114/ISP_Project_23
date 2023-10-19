// Import necessary dependencies and modules
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary'; // Using the Cloudinary API for image uploads
import streamifier from 'streamifier';
import { isAdmin, isAuth } from '../utils.js'; // Custom authentication and authorization middleware

// Initialize the Multer middleware for file uploads
const upload = multer();

// Create an Express Router for file upload routes
const uploadRouter = express.Router();

// Define a route for uploading files (typically images)
uploadRouter.post(
  '/',
  isAuth, // Authentication middleware to ensure the user is logged in
  isAdmin, // Authorization middleware to check if the user is an admin
  upload.single('file'), // Handle single-file uploads

  // Asynchronous request handler for file upload
  async (req, res) => {
    // Configure Cloudinary with API credentials using environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Function to upload a file stream to Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        // Create a writable stream for uploading the file to Cloudinary
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result); // Resolve the promise with the uploaded result
          } else {
            reject(error); // Reject the promise if there's an error
          }
        });

        // Create a readable stream from the file buffer and pipe it to the Cloudinary stream
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    // Upload the file to Cloudinary using the defined streamUpload function
    const result = await streamUpload(req);

    // Send the result from the Cloudinary upload as the response
    res.send(result);
  }
);

// Export the uploadRouter for use in the application
export default uploadRouter;
