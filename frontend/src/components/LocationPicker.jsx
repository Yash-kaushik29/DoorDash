import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 28.82,
  lng: 78.23,
};

const LocationPicker = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationName, setLocationName] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAPS_KEY, // Replace with your actual API key
  });

  // const onMapClick = useCallback((event) => {
  //   const lat = event.latLng.lat();
  //   const lng = event.latLng.lng();
  //   setSelectedLocation({ lat, lng });

  //   // Optional: Reverse geocoding
  //   fetch(
  //     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_MAPS_KEY}`
  //   )
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.results.length > 0) {
  //         setLocationName(data.results[0].formatted_address);
  //       } else {
  //         setLocationName("Unknown location");
  //       }
  //     });
  // }, []);

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) return;

    setFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        setFetchingLocation(false);
      },
      () => {
        setFetchingLocation(false);
      }
    );
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div className="w-full h-[80vh] mb-20">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedLocation || center}
        zoom={14}
      >
        {selectedLocation && (
          <Marker position={selectedLocation} />
        )}
      </GoogleMap>

      <div className="mt-4 text-center">
        <button
          onClick={handleGetMyLocation}
          disabled={fetchingLocation}
          className={`px-4 py-2 rounded-lg text-white ${
            fetchingLocation ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {fetchingLocation ? "Locating..." : "📍 Get My Location"}
        </button>

        <p className="mt-3 text-sm text-gray-700">
          {selectedLocation ? (
            <>
              Selected Location:{" "}
              <strong>
                {selectedLocation.lat.toFixed(5)},{" "}
                {selectedLocation.lng.toFixed(5)}
              </strong>
            </>
          ) : (
            "No location selected"
          )}
        </p>

        {locationName ? (
          <p className="mt-2 text-sm text-gray-600">
            <strong>Location:</strong> {locationName}
          </p>
        ) : (
          "No location"
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
