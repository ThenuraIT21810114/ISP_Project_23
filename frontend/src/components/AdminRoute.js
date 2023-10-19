import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom'; // React Router for navigation
import { Store } from '../Store'; // Import the Store context

export default function AdminRoute({ children }) {
  // Access the global state from the Store context
  const { state } = useContext(Store);
  const { userInfo } = state; // Extract the 'userInfo' object from the state

  // Check if the user is an admin (userInfo.isAdmin is true) and render 'children',
  // which represents the component wrapped by this 'AdminRoute' component.
  // If the user is not an admin, redirect to the "/signin" route.
  return userInfo && userInfo.isAdmin ? children : <Navigate to="/signin" />;
}
