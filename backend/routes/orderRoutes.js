import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, sendMail, payOrderEmailTemplate } from '../utils.js';
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
      discountCode: req.body.discountCode,
      discountAmount: req.body.discountAmount,
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

    const completedOrders = await Order.countDocuments({ isDelivered: true }); //delievered orders
    const paidOrders = await Order.countDocuments({ isPaid: true }); // Add this line to count paid orders
    const discountUsers = await Order.countDocuments({
      discountCode: { $ne: null },
    }); // Add this line to count customers with discount codes

    const topProducts = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: '$orderItems.product', // Group by product ID
          productName: { $first: '$orderItems.name' }, // Get the product name
          totalQuantitySold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: '$orderItems.price' },
        },
      },
      {
        $sort: { totalQuantitySold: -1 }, // Sort by total quantity sold in descending order
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

    // Fetch recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name');

    // New: Calculate monthly summaries
    const monthlySummaries = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // New: Calculate yearly summaries
    const yearlySummaries = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' } },
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1 } },
    ]);

    // Fetch low-stock products
    const lowStockThreshold = 10; // Adjust the threshold as needed
    const lowStockProducts = await Product.find({
      countInStock: { $lte: lowStockThreshold },
    });

    res.send({
      users,
      orders,
      completedOrders,
      paidOrders,
      discountUsers,
      topProducts,
      dailyOrders,
      productCategories,
      recentOrders, // Include recent orders
      monthlySummaries, // Include monthly summaries
      yearlySummaries, // Include yearly summaries
      lowStockProducts, // Include low-stock products
    });
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
      const emailHtml = payOrderEmailTemplate(order);

      sendMail({
        to: `${order.user.name} <${order.user.email}>`,
        subject: `New Order ${order.user.email}`,
        html: emailHtml, // Use the emailHtml variable here
      });
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
