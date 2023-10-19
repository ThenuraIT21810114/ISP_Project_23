// Import necessary dependencies and modules
import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import {
  isAuth, // Authentication middleware
  isAdmin, // Authorization middleware for admin roles
  isSupplier, // Custom authorization middleware for supplier roles
  generateToken, // Function to generate authentication tokens
  baseUrl, // Function to retrieve the base URL
  sendMail, // Function to send emails
} from '../utils.js'; // Custom utility functions
import User from '../models/userModel.js'; // User model
import jwt from 'jsonwebtoken'; // JSON Web Token library for token verification
import pdf from 'pdfkit'; // PDF generation library

// Create an Express Router for user-related routes
const userRouter = express.Router();

// Define a route for generating a PDF report for a specific user
userRouter.get(
  '/:id/report',
  isAuth, // Authentication middleware
  expressAsyncHandler(async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      // Create a PDF document
      const doc = new pdf();

      // Pipe the PDF to the response
      doc.pipe(res);

      // Define a standard template for the PDF
      const standardTemplate = (headerText) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .text(headerText, { align: 'center' })
          .moveDown(1);
      };

      // Add content to the PDF, including user details
      standardTemplate('User Details');

      doc.font('Helvetica');
      doc.fontSize(12);

      doc.text(`User ID: ${user._id}`);
      doc.text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Is Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
      doc.text(`Is Supplier: ${user.isSupplier ? 'Yes' : 'No'}`);

      // End the document
      doc.end();
    } catch (err) {
      return res.status(500).send({ message: 'Error generating PDF' });
    }
  })
);

// Define a route to retrieve a list of users (for admin and supplier roles)
userRouter.get(
  '/',
  isAuth, // Authentication middleware
  isAdmin, // Authorization middleware for admin roles
  isSupplier, // Custom authorization middleware for supplier roles
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

// Define a route to retrieve information about a specific user (for admin and supplier roles)
userRouter.get(
  '/:id',
  isAuth, // Authentication middleware
  isAdmin, // Authorization middleware for admin roles
  isSupplier, // Custom authorization middleware for supplier roles
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

// Define a route to update user information (for admin and supplier roles)
userRouter.put(
  '/:id',
  isAuth, // Authentication middleware
  isAdmin, // Authorization middleware for admin roles
  isSupplier, // Custom authorization middleware for supplier roles
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      user.isSupplier = Boolean(req.body.isSupplier);
      const updatedUser = await user.save();
      res.send({ message: 'User Updated', user: updatedUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

// Define a route to initiate the password reset process
userRouter.post(
  '/forget-password',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      // Generate a JWT token for resetting the password with a short expiration time
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '3h',
      });
      user.resetToken = token;
      await user.save();

      // Send a password reset link to the user's email
      sendMail({
        to: `${user.name} <${user.email}>`,
        subject:
          'Reset Password For User Account in Gara Fashion Clothing Sri Lanka',
        html: `
          <h1> Hi ${user.name} </h1>
          <p>Please Click the following link to reset your password:</p>
          <a href="${baseUrl()}/reset-password/${token}">Reset Password</a>
          <p>Happy Shopping</p>
          <h2>The Gara Fashion Team</h2>
        `,
      });

      res.send({ message: 'We sent a reset password link to your email.' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

// Define a route to reset the user's password using a valid token
userRouter.post(
  '/reset-password',
  expressAsyncHandler(async (req, res) => {
    // Verify the provided token using the JWT secret
    jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        const user = await User.findOne({ resetToken: req.body.token });
        if (user) {
          if (req.body.password) {
            // Hash and update the user's password
            user.password = bcrypt.hashSync(req.body.password, 8);
            await user.save();
            res.send({
              message: 'Password reset successfully',
            });
          }
        } else {
          res.status(404).send({ message: 'User not found' });
        }
      }
    });
  })
);

// Define a route to delete a user (excluding admin user)
userRouter.delete(
  '/:id',
  isAuth, // Authentication middleware
  isAdmin, // Authorization middleware for admin roles
  isSupplier, // Custom authorization middleware for supplier roles
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === 'admin@example.com') {
        res.status(400).send({ message: 'Cannot Delete Admin User' });
        return;
      }
      await user.deleteOne();
      res.send({ message: 'User Deleted' });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

// Define a route for user sign-in
userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isSupplier: user.isSupplier,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

// Define a route for user sign-up
userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSupplier: user.isSupplier,
      token: generateToken(user),
    });
  })
);

// Define a route to update the user's profile
userRouter.put(
  '/profile',
  isAuth, // Authentication middleware
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isSupplier: updatedUser.isSupplier,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

// Export the userRouter for use in the application
export default userRouter;
