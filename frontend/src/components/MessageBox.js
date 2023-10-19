import Alert from 'react-bootstrap/Alert'; // Importing the Bootstrap Alert component

export default function MessageBox(props) {
  return (
    <Alert variant={props.variant || 'info'}>
      {/* Rendering an alert with the specified variant or 'info' as the default */}
      {props.children}
      {/* Displaying the content within the alert, which is passed as children */}
    </Alert>
  );
}
