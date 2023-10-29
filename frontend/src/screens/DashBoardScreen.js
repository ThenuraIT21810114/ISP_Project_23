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

  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: 0 });

  // State to store monthly expenses
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);

  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Function to handle expense submission for the current month
  const addExpense = () => {
    if (newExpense.name && newExpense.amount > 0) {
      // Update the expenses state with the new expense
      setExpenses([...expenses, newExpense]);

      // Update the monthly expenses state for the current month
      const currentMonth = new Date().getMonth() + 1; // 1-based month
      const currentYear = new Date().getFullYear();
      setMonthlyExpenses((prevMonthlyExpenses) => {
        const updatedMonthlyExpenses = [...prevMonthlyExpenses];
        const existingMonthIndex = updatedMonthlyExpenses.findIndex(
          (entry) => entry.month === currentMonth && entry.year === currentYear
        );

        if (existingMonthIndex !== -1) {
          // If the current month's entry exists, update it
          updatedMonthlyExpenses[existingMonthIndex].expenses.push(newExpense);
        } else {
          // If the current month's entry doesn't exist, create it
          updatedMonthlyExpenses.push({
            month: currentMonth,
            year: currentYear,
            expenses: [newExpense],
          });
        }

        return updatedMonthlyExpenses;
      });

      setNewExpense({ name: '', amount: 0 });
    }
  };

  // Function to calculate monthly profit or loss based on entered expenses
  const calculateMonthlyProfitLoss = (month, year) => {
    const monthExpenses = monthlyExpenses.find(
      (entry) => entry.month === month && entry.year === year
    );
    const totalMonthlyExpenses = monthExpenses
      ? monthExpenses.expenses.reduce(
          (total, expense) => total + expense.amount,
          0
        )
      : 0;

    const monthSummary = summary.monthlySummaries.find(
      (summary) => summary._id.month === month && summary._id.year === year
    );
    const totalSales = monthSummary ? monthSummary.totalSales : 0;

    return totalSales - totalMonthlyExpenses;
  };

  // Function to generate and download the monthly expense and profit/loss report as a PDF
  const generateMonthlyExpenseReportPDF = (month, year) => {
    const doc = new jsPDF();

    // Add content to the PDF document
    doc.text(
      `Monthly Expense and Profit/Loss Report - ${getMonthName(month)} ${year}`,
      10,
      10
    );

    // Add monthly expenses
    const monthExpenses = monthlyExpenses.find(
      (entry) => entry.month === month && entry.year === year
    );
    if (monthExpenses) {
      const monthlyExpensesTable = [['Expense Name', 'Expense Amount']];
      monthExpenses.expenses.forEach((expense) => {
        monthlyExpensesTable.push([
          expense.name,
          `LKR ${expense.amount.toFixed(2)}`,
        ]);
      });

      doc.autoTable({
        head: [monthlyExpensesTable[0]],
        body: monthlyExpensesTable.slice(1),
        startY: 20,
      });
    }

    // Calculate and add profit or loss for the month
    const profitLoss = calculateMonthlyProfitLoss(month, year);
    doc.text(
      `Profit/Loss: LKR ${profitLoss.toFixed(2)}`,
      10,
      doc.autoTable.previous.finalY + 10
    );

    // Save the PDF with a unique name
    const date = new Date().toISOString().slice(0, 10);
    const filename = `MonthlyExpenseReport_${getMonthName(
      month
    )}_${year}_${date}.pdf`;

    doc.save(filename);
  };

  // Calculate profit or loss
  const profitOrLoss = summary
    ? summary.orders[0].totalSales - totalExpenses
    : 0; // Ensure summary is defined

  // Function to generate and download the P&L report as a PDF
  const generateProfitLossReportPDF = () => {
    const doc = new jsPDF();

    // Add content to the PDF document
    doc.text('Profit and Loss Report', 10, 10);

    // Add total sales
    doc.text(
      `Total Sales: LKR ${
        summary ? summary.orders[0].totalSales.toFixed(2) : 0
      }`,
      20,
      30
    );

    // Add total expenses
    doc.text(`Total Expenses: LKR ${totalExpenses.toFixed(2)}`, 20, 40);

    // Add profit or loss
    doc.text(`Profit/Loss: LKR ${profitOrLoss.toFixed(2)}`, 20, 50);

    // Save the PDF with a unique name
    const date = new Date().toISOString().slice(0, 10);
    const filename = `ProfitLossReport_${date}.pdf`;

    doc.save(filename);
  };

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
          <div>
            <h2>Enter Expenses</h2>
            <div>
              <input
                type="text"
                placeholder="Expense Name"
                value={newExpense.name}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, name: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Expense Amount"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    amount: parseFloat(e.target.value),
                  })
                }
              />
              <button onClick={addExpense}>Add Expense</button>
            </div>
            <h4>Total Expenses: LKR {totalExpenses.toFixed(2)}</h4>
            <h4>Profit/Loss: LKR {profitOrLoss.toFixed(2)}</h4>
          </div>

          <div>
            <h3>Generate Reports</h3>
            {/* Add a button to generate and download the P&L report */}
            <div className="my-3">
              <button
                className="sales-button"
                onClick={generateProfitLossReportPDF}
              >
                Download Profit and Loss PDF
              </button>
            </div>
            {/* Add a button to generate and download monthly expense reports */}
            <div className="my-3">
              {monthlyExpenses.map((entry) => (
                <button
                  className="sales-button"
                  key={`expense-report-${entry.month}-${entry.year}`}
                  onClick={() =>
                    generateMonthlyExpenseReportPDF(entry.month, entry.year)
                  }
                >
                  Download {getMonthName(entry.month)} {entry.year} Expense
                  Report
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
