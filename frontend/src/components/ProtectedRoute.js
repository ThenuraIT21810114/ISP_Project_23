import React, { useContext } from 'react'; // Importing React and the useContext hook
import { Navigate } from 'react-router-dom'; // Importing the Navigate component from React Router
import { Store } from '../Store'; // Importing the Store context

export default function ProtectedRoute({ children }) {
  // A React functional component named ProtectedRoute
  const { state } = useContext(Store); // Accessing the state from the Store context
  const { userInfo } = state; // Destructuring the 'userInfo' from the state

  return userInfo ? children : <Navigate to="/signin" />;
  // If 'userInfo' is truthy (user is authenticated), render the 'children' (nested components),
  // otherwise, navigate to the '/signin' route.
}

// Exporting the ProtectedRoute component
