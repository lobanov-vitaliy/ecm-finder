import React, { memo, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import LatLon from "geodesy/latlon-ellipsoidal-vincenty.js";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = { lat: 49.388435, lng: 30.939399 };
const zoom = 6;

const Map = ({ points, distance }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAGYuBCRSnS8nuOayBIFqYBLggMxXuLeLA",
  });
  const ref = useRef();

  useEffect(() => {
    const polylines = [];
    if (ref.current) {
      const bounds = new window.google.maps.LatLngBounds();
      points.forEach(({ lat, lon, azimuth }) => {
        const start = new LatLon(parseFloat(lat), parseFloat(lon));
        const end = start.destinationPoint(
          distance * 1000,
          parseFloat(azimuth)
        );

        const polyline = new window.google.maps.Polyline({
          path: [
            { lat: start.lat, lng: start.lon },
            { lat: end.lat, lng: end.lon },
          ],
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });
        polyline.setMap(ref.current);
        polylines.push(polyline);
        bounds.extend({ lat: start.lat, lng: start.lon });
        bounds.extend({ lat: end.lat, lng: end.lon });
      });
      if (!bounds.isEmpty()) {
        ref.current.fitBounds(bounds);
      }
    }

    return () => {
      polylines.forEach((polyline) => polyline.setMap(null));
    };
  }, [ref, points, distance]);

  const onLoad = useCallback(function callback(map) {
    ref.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    ref.current = null;
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <GoogleMap
        center={center}
        zoom={zoom}
        mapTypeId="hybrid" // satellite
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />
    </>
  );
};

export default memo(Map);
