import React, { useContext, useEffect, useReducer, useState } from 'react';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function DashBoardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  // State to store low-stock products
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userInfo && userInfo.token) {
          // Pass the token in the headers
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };

          const { data } = await axios.get('/api/orders/summary', config);
          dispatch({ type: 'FETCH_SUCCESS', payload: data });

          // Fetch low-stock products
          const lowStockResponse = await axios.get(
            '/api/products/lowstock',
            config
          );
          setLowStockProducts(lowStockResponse.data);
        }
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);

  // Function to get month name from numeric value
  const getMonthName = (month) => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthNames[month - 1];
  };

  // Check if monthlySummaries and yearlySummaries are available
  const monthlySummaries =
    summary && summary.monthlySummaries ? summary.monthlySummaries : [];
  const yearlySummaries =
    summary && summary.yearlySummaries ? summary.yearlySummaries : [];

  // Monthly Sales Chart Data Mapping
  const monthlySalesData = [
    ['Month', 'Number of Orders', 'Total Sales'],
    ...monthlySummaries.map((summary) => [
      `${getMonthName(summary._id.month)} ${summary._id.year}`,
      summary.numOrders,
      summary.totalSales,
    ]),
  ];

  // Yearly Sales Chart Data Mapping
  const yearlySalesData = [
    ['Year', 'Number of Orders', 'Total Sales'],
    ...yearlySummaries.map((summary) => [
      summary._id.year,
      summary.numOrders,
      summary.totalSales,
    ]),
  ];

  const generateDailySalesPDF = () => {
    // Create a new PDF document for daily sales
    const doc = new jsPDF();

    // Add content to the PDF document
    doc.text('Daily Sales Report', 10, 10);

    // Add daily sales data to the PDF
    const dailySalesTable = [];
    dailySalesTable.push([
      'Date',
      'Number of Orders',
      'Completed Orders',
      'Paid Orders',
      'Sales',
    ]);
    summary.dailyOrders.forEach((order) => {
      // Format the sales value as "LKR 10,000.00"
      const formattedSales = `LKR ${order.sales
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

      // Add the number of orders, completed orders, paid orders, date, and formatted sales to the table
      dailySalesTable.push([
        order._id,
        order.orders,
        order.completedOrders,
        order.paidOrders,
        formattedSales,
      ]);
    });

    doc.autoTable({
      head: [dailySalesTable[0]],
      body: dailySalesTable.slice(1),
      startY: 20,
    });

    // Save the PDF with a unique name (e.g., based on the report date)
    const date = new Date().toISOString().slice(0, 10);
    const filename = `DailySalesReport_${date}.pdf`;

    // Save the PDF and make it downloadable
    doc.save(filename);
  };

  const generateMonthlySalesPDF = () => {
    const doc = new jsPDF();

    doc.text('Monthly Sales Report', 10, 10);

    const monthlySalesTable = [];
    monthlySalesTable.push([
      'Month',
      'Number of Orders',
      'Completed Orders',
      'Paid Orders',
      'Sales',
    ]);

    summary.monthlySummaries.forEach((monthData) => {
      const formattedSales = `LKR ${monthData.totalSales
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

      monthlySalesTable.push([
        `${getMonthName(monthData._id.month)} ${monthData._id.year}`,
        monthData.numOrders,
        monthData.completedOrders,
        monthData.paidOrders,
        formattedSales,
      ]);
    });

    doc.autoTable({
      head: [monthlySalesTable[0]],
      body: monthlySalesTable.slice(1),
      startY: 20,
    });

    const date = new Date().toISOString().slice(0, 10);
    const filename = `MonthlySalesReport_${date}.pdf`;

    doc.save(filename);
  };

  const generateAnnualSalesPDF = () => {
    const doc = new jsPDF();

    doc.text('Annual Sales Report', 10, 10);

    const annualSalesTable = [];
    annualSalesTable.push([
      'Year',
      'Number of Orders',
      'Completed Orders',
      'Paid Orders',
      'Sales',
    ]);

    summary.yearlySummaries.forEach((yearData) => {
      const formattedSales = `LKR ${yearData.totalSales
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

      annualSalesTable.push([
        yearData._id.year,
        yearData.numOrders,
        yearData.completedOrders,
        yearData.paidOrders,
        formattedSales,
      ]);
    });

    doc.autoTable({
      head: [annualSalesTable[0]],
      body: annualSalesTable.slice(1),
      startY: 20,
    });

    const date = new Date().toISOString().slice(0, 10);
    const filename = `AnnualSalesReport_${date}.pdf`;

    doc.save(filename);
  };

  return (
    <div>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <h1>Dashboard</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <i
                      className="fas fa-user"
                      style={{ marginRight: '5px' }}
                    ></i>
                    {summary.users && summary.users[0]
                      ? summary.users[0].numUsers
                      : 0}
                  </Card.Title>
                  <Card.Text> No of Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <i
                      className="fas fa-shopping-bag"
                      style={{ marginRight: '5px' }}
                    ></i>
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>
                  <Card.Text> No of Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <i
                      className="fas fa-chart-line"
                      style={{ marginRight: '5px' }}
                    ></i>
                    LKR
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}
                  </Card.Title>
                  <Card.Text> Total Sales</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <i
                      className="fas fa-check-circle"
                      style={{ marginRight: '5px' }}
                    ></i>
                    {summary.completedOrders ? summary.completedOrders : 0}
                  </Card.Title>
                  <Card.Text> Completed Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <i
                      className="fas fa-money-check"
                      style={{ marginRight: '5px' }}
                    ></i>
                    {summary.paidOrders ? summary.paidOrders : 0}
                  </Card.Title>
                  <Card.Text> Paid Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <i
                      className="fas fa-tags"
                      style={{ marginRight: '5px' }}
                    ></i>
                    {summary.discountUsers ? summary.discountUsers : 0}
                  </Card.Title>
                  <Card.Text> Customers with Discount Code</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="my-3">
            <h2>Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                ]}
              ></Chart>
            )}
          </div>
          {/* Monthly Sales Chart */}
          <div>
            <h2>Monthly Sales Summary</h2>
            <Chart
              width="100%"
              height="400px"
              chartType="LineChart"
              loader={<div>Loading Chart...</div>}
              data={monthlySalesData}
              options={{
                title: 'Monthly Sales Summary',
                hAxis: { title: 'Month' },
                vAxis: { title: 'Value' },
                legend: { position: 'top' },
              }}
            />
          </div>

          {/* Yearly Sales Chart */}
          <div>
            <h2>Yearly Sales Summary</h2>
            <Chart
              width="100%"
              height="400px"
              chartType="BarChart"
              loader={<div>Loading Chart...</div>}
              data={yearlySalesData}
              options={{
                title: 'Yearly Sales Summary',
                hAxis: { title: 'Value' },
                vAxis: { title: 'Year' },
                legend: { position: 'top' },
              }}
            />
          </div>
          <div>
            <h2>Top Selling Products</h2>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Product ID</th>
                  <th style={{ textAlign: 'center' }}>Product Name</th>
                  <th style={{ textAlign: 'center' }}>Quantity Sold</th>
                  <th style={{ textAlign: 'center' }}>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {summary.topProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product._id}</td>
                    <td style={{ textAlign: 'center' }}>
                      {product.productName}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {product.totalQuantitySold}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      LKR{product.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Recent Orders</h2>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Order ID</th>
                  <th style={{ textAlign: 'center' }}>Customer Name</th>
                  <th style={{ textAlign: 'center' }}>Order Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td style={{ textAlign: 'center' }}>
                      {order.user?.name || 'Guest'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="my-3">
            <h2>Categories</h2>
            {summary.productCategories.length === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Category', 'Products'],
                  ...summary.productCategories.map((x) => [x._id, x.count]),
                ]}
              ></Chart>
            )}
          </div>
          {/* Display low-stock products */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Card.Title>Low Stock Products</Card.Title>
                  <ul>
                    {lowStockProducts.map((product) => (
                      <li key={product._id}>
                        <strong>{product.name}</strong> - Stock:{' '}
                        {product.countInStock}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div>
            <h2>Sales Reports</h2>
            {/* Add a button to generate Daily Sales PDF */}
            <div className="my-3">
              <button className="sales-button" onClick={generateDailySalesPDF}>
                Download Daily Sales PDF
              </button>
            </div>
            {/* Add a button to generate Monthly Sales PDF */}
            <div className="my-3">
              <button
                className="sales-button"
                onClick={generateMonthlySalesPDF}
              >
                Download Monthly Sales PDF
              </button>
            </div>
            {/* Add a button to generate Monthly Sales PDF */}
            <div className="my-3">
              <button className="sales-button" onClick={generateAnnualSalesPDF}>
                Download Annual Sales PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
