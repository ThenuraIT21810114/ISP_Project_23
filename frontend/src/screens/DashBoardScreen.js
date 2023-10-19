import React, { useContext, useEffect, useReducer } from 'react';
import Chart from 'react-google-charts'; // Importing a chart library
import axios from 'axios'; // Importing axios for making HTTP requests
import { Store } from '../Store'; // Importing a Store component
import { getError } from '../utils'; // Importing a utility function
import LoadingBox from '../components/LoadingBox'; // Importing a loading component
import MessageBox from '../components/MessageBox'; // Importing a message box component
import Row from 'react-bootstrap/Row'; // Importing a Bootstrap Row component
import Col from 'react-bootstrap/Col'; // Importing a Bootstrap Col component
import Card from 'react-bootstrap/Card'; // Importing a Bootstrap Card component
import { Helmet } from 'react-helmet-async'; // Importing Helmet for handling document head changes

// Reducer function for managing state
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }; // Indicate a loading state
    case 'FETCH_SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      }; // Indicate a successful fetch with data
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }; // Indicate a fetch failure with an error message
    default:
      return state;
  }
};

// Main component for the dashboard
export default function DashBoardScreen() {
  // Use the reducer to manage the component's state
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Access the user information from the context
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Fetch data from the server when userInfo changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data }); // Dispatch a successful fetch action
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err), // Dispatch a fetch failure action with an error message
        });
      }
    };
    fetchData();
  }, [userInfo]); // Only trigger this effect when userInfo changes

  return (
    <div>
      <Helmet>
        <title>Dashboard</title> {/* Set the title in the document head */}
      </Helmet>
      <h1>Dashboard</h1> {/* Render the dashboard title */}
      {loading ? ( // Display a loading component if data is loading
        <LoadingBox />
      ) : error ? ( // Display an error message if there's an error
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          {' '}
          {/* Render the dashboard content if no loading or error */}
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
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
