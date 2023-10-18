import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utils.js';
import pdf from 'pdfkit';

const orderRouter = express.Router();

orderRouter.get(
  '/:id/pdf',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId).populate('user');

      if (!order) {
        return res.status(404).send({ message: 'Order not found' });
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

      // Add content to the PDF, including order details
      standardTemplate('Order Details');

      doc.font('Helvetica');
      doc.fontSize(12);

      doc.text(`Order ID: ${order._id}`);
      doc.text(`Order Date: ${order.createdAt}`);
      doc.text(`Shipping Address:`);
      doc.text(`Name: ${order.shippingAddress.fullName}`);
      doc.text(`Address: ${order.shippingAddress.address},`);
      doc.text(
        `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
      );

      // Add more details as needed

      // Add order items
      doc.text(`Order Items:`);
      order.orderItems.forEach((item, index) => {
        doc.text(`${index + 1}. Product: ${item.name}`);
        doc.text(`   Quantity: ${item.quantity}`);
        doc.text(`   Price: LKR ${item.price}`);
      });

      doc.text(`Shipping Price: LKR ${order.shippingPrice}`);
      doc.text(`Tax: LKR ${order.taxPrice}`);
      doc.text(`Total Order Price: LKR ${order.totalPrice}`);
      // Add order delivery status
      doc.text(
        `Order Delivery Status: ${
          order.isDelivered ? 'Delivered' : 'Not Delivered'
        }`
      );

      // Add order payment status
      doc.text(`Order Payment Status: ${order.isPaid ? 'Paid' : 'Not Paid'}`);

      // End the document
      doc.end();
    } catch (err) {
      return res.status(500).send({ message: 'Error generating PDF' });
    }
  })
);

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);

    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);

    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.send({ users, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      mailgun()
        .messages()
        .send(
          {
            from: 'GaraFashion <mailgun@sandbox-123.mailgun.org>',
            to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.error('Mailgun API Error:', error);
              // Handle the error appropriately, e.g., send an error response.
            } else {
              console.log('Mailgun API Response:', body);
              // Send a success response.
            }
          }
        );
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

export default orderRouter;
