import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import {
  isAuth,
  isAdmin,
  isSupplier,
  generateToken,
  baseUrl,
  sendMail,
} from '../utils.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import pdf from 'pdfkit';
const userRouter = express.Router();

userRouter.get(
  '/:id/report',
  isAuth,
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

      // Define a standard template
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

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  isSupplier,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  isSupplier,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  isSupplier,
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

userRouter.post(
  '/forget-password',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '3h',
      });
      user.resetToken = token;
      await user.save();

      //reset link
      console.log(`${baseUrl()}/reset-password/${token}`);

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

userRouter.post(
  '/reset-password',
  expressAsyncHandler(async (req, res) => {
    jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        const user = await User.findOne({ resetToken: req.body.token });
        if (user) {
          if (req.body.password) {
            user.password = bcrypt.hashSync(req.body.password, 8);
            await user.save();
            res.send({
              message: 'Password reseted successfully',
            });
          }
        } else {
          res.status(404).send({ message: 'User not found' });
        }
      }
    });
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  isSupplier,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === 'admin@example.com') {
        res.status(400).send({ message: 'Can Not Delete Admin User' });
        return;
      }

      // Construct the signup page link
      const signupPageLink = 'http://localhost:3000/signup?redirect=/'; // Replace with your actual signup page URL

      sendMail({
        to: `${user.name} <${user.email}>`,
        subject: `Account Deletion Notification`,
        html: `<h1> Hi ${user.name} </h1>
        <p>Your account has been deleted.</p>
        <p>If you'd like to create a new account, you can sign up again:</p>
        <a href="${signupPageLink}">Sign Up</a>
        <p>Thank You</p>
        <p>Happy Shopping</p>
        <h2>The Gara Fashion Team</h2>`,
      });

      await user.deleteOne();
      res.send({ message: 'User Deleted' });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

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

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
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

userRouter.put(
  '/profile/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const userId = req.params.id; // Get the user's ID from the URL parameter
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

export default userRouter;
