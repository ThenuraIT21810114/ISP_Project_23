import React, { useContext, useEffect, useReducer } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);

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
        </>
      )}
    </div>
  );
}
