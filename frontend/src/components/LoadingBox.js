import Spinner from 'react-bootstrap/Spinner'; // Importing the Bootstrap Spinner component

export default function LoadingBox() {
  return (
    <Spinner animation="border" role="status">
      {/* Rendering a spinner with the "border" animation style */}
      <span className="visually-hidden">Loading...</span>
      {/* Displaying a visually hidden "Loading..." text for accessibility */}
    </Spinner>
  );
}
