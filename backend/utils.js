import jwt from 'jsonwebtoken'; // JSON Web Token library for authentication
import nodemailer from 'nodemailer'; // Nodemailer library for sending emails

// Function to determine the base URL for the application
export const baseUrl = () =>
  process.env.BASE_URL
    ? process.env.BASE_URL // Use the BASE_URL from environment variables if defined
    : process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000' // Use a default URL for development environment
    : 'https://yourdomain.com'; // Use a custom URL for production environment

// Function to generate a JSON Web Token (JWT) for user authentication
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSupplier: user.isSupplier,
    },
    process.env.JWT_SECRET, // Sign the token using the JWT_SECRET from environment variables
    {
      expiresIn: '30d', // Token expires in 30 days
    }
  );
};

// Middleware function to check if a user is authenticated
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Extract the token (e.g., Bearer XXXXXX)
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

// Middleware function to check if a user is a supplier
export const isSupplier = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Extract the token (e.g., Bearer XXXXXX)
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

// Middleware function to check if a user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

// Create a Nodemailer transporter for sending emails
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'thenura123nemhan@gmail.com',
    pass: 'jhbn thtg sccv xktb',
  },
});

// Function to send an email using Nodemailer
export const sendMail = (mailOptions) => {
  console.log('test mail.....');
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// Function to generate an email template for a payment order
export const payOrderEmailTemplate = (order) => {
  return `<h1>Thanks for shopping with us</h1>
  <p>
  Hi ${order.user.name},</p>
  <p>We have finished processing your order.</p>
  <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
  <table>
  <thead>
  <tr>
  <td><strong>Product</strong></td>
  <td><strong>Quantity</strong></td>
  <td style="text-align: right;"><strong>Price</strong></td>
  </thead>
  <tbody>
  ${order.orderItems
    .map(
      (item) => `
    <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td style="text-align: right;"> LKR${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('\n')}
  </tbody>
  <tfoot>
  <tr>
  <td colspan="2">Items Price:</td>
  <td align="right"> LKR${order.itemsPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2">Shipping Price:</td>
  <td align="right"> LKR${order.shippingPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2"><strong>Total Price:</strong></td>
  <td align="right"><strong> LKR${order.totalPrice.toFixed(2)}</strong></td>
  </tr>
  <tr>
  <td colspan="2">Payment Method:</td>
  <td align="right">${order.paymentMethod}</td>
  </tr>
  </table>

  <h2>Shipping address</h2>
  <p>
  ${order.shippingAddress.fullName},<br/>
  ${order.shippingAddress.address},<br/>
  ${order.shippingAddress.city},<br/>
  ${order.shippingAddress.country},<br/>
  ${order.shippingAddress.postalCode}<br/>
  </p>
  <hr/>
  <p>
  Thanks for shopping with us.
  </p>
  <h3>The Gara Fashion Team</h3>
  `;
};
