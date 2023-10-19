import axios from 'axios'; // Import Axios for making HTTP requests
import React, { useContext, useEffect, useRef, useState } from 'react'; // Import React and related hooks
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from '@react-google-maps/api'; // Import components and libraries from the react-google-maps package
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import { Store } from '../Store'; // Import a Store component for global state management
import Button from 'react-bootstrap/Button'; // Import a Bootstrap Button component
import { toast } from 'react-toastify'; // Import toast notifications

const defaultLocation = { lat: 45.516, lng: -73.56 }; // Default map location
const libs = ['places']; // Google Maps libraries used

// Component for handling the map screen
export default function MapScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store); // Access global state
  const { userInfo } = state; // Destructure user info from the global state
  const navigate = useNavigate(); // Initialize a navigation function
  const [googleApiKey, setGoogleApiKey] = useState(''); // State for the Google API key
  const [center, setCenter] = useState(defaultLocation); // State for the map center
  const [location, setLocation] = useState(center); // State for the selected location

  // Refs for accessing the map, search box, and marker components
  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);

  // Function to get the user's current location
  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  // Fetch the Google API key and set the user's current location
  useEffect(() => {
    const fetch = async () => {
      const { data } = await axios('/api/keys/google', {
        headers: { Authorization: `BEARER ${userInfo.token}` },
      });
      setGoogleApiKey(data.key);
      getUserCurrentLocation();
    };

    fetch();
    ctxDispatch({
      type: 'SET_FULLBOX_ON',
    });
  }, [ctxDispatch, userInfo.token]);

  // Callback function when the map loads
  const onLoad = (map) => {
    mapRef.current = map;
  };

  // Callback function when the map becomes idle
  const onIdle = () => {
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  // Callback function when the search box loads
  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  // Callback function when places change in the search box
  const onPlacesChanged = () => {
    const place = placeRef.current.getPlaces()[0].geometry.location;
    setCenter({ lat: place.lat(), lng: place.lng() });
    setLocation({ lat: place.lat(), lng: place.lng() });
  };

  // Callback function when the marker loads
  const onMarkerLoad = (marker) => {
    markerRef.current = marker;
  };

  // Function to confirm the selected location and navigate to the next screen
  const onConfirm = () => {
    const places = placeRef.current.getPlaces() || [{}];
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: places[0].formatted_address,
        name: places[0].name,
        vicinity: places[0].vicinity,
        googleAddressId: places[0].id,
      },
    });
    toast.success('Location selected successfully.');
    navigate('/shipping');
  };

  return (
    <div className="full-box">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="smaple-map"
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            <div className="map-input-box">
              <input type="text" placeholder="Enter your address"></input>
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </StandaloneSearchBox>
          <Marker position={location} onLoad={onMarkerLoad}></Marker>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
