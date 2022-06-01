import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useCSVReader } from "react-papaparse";
import "./App.css";
import LatLon from "geodesy/latlon-ellipsoidal-vincenty.js";

const containerStyle = {
  width: "100%",
  height: "100%",
};

function MyComponent() {
  const { CSVReader } = useCSVReader();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAGYuBCRSnS8nuOayBIFqYBLggMxXuLeLA",
  });
  const [points, setPoints] = useState({});
  const [distance, setDistance] = useState(5);
  const ref = useRef();

  const onLoad = useCallback(function callback(map) {
    map.setCenter(new window.google.maps.LatLng(49.486875, 31.049479));
    ref.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    ref.current = null;
  }, []);

  useEffect(() => {
    const map = ref.current;
    const values = Object.values(points || {}).flat();
    if (map && values.length > 0) {
      console.log("values", values);
      const bounds = new window.google.maps.LatLngBounds();
      const lines = [];

      values.forEach(({ start, azimuth }) => {
        const end = start.destinationPoint(distance * 1000, azimuth);

        const startLatLng = new window.google.maps.LatLng(start.lat, start.lon);
        const endLatLng = new window.google.maps.LatLng(end.lat, end.lon);

        const path = new window.google.maps.Polyline({
          path: [startLatLng, endLatLng],
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });

        lines.push(path);

        bounds.extend(startLatLng);
        bounds.extend(endLatLng);
      });

      lines.forEach((line) => {
        line.setMap(map);
      });
      map.fitBounds(bounds);

      return () => {
        lines.forEach((line) => {
          line.setMap(null);
        });
      };
    }
  }, [points, distance, ref]);

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <CSVReader
        onUploadAccepted={({ data, errors }, file) => {
          console.log(`success parsing ${data.length} lines, Errors:`, errors);
          const [header, ...lines] = data;
          const result = [];
          lines.forEach((line) => {
            const [time, lat, lon, azimuth, ...frequencies] = line;

            const parts = [];
            let currentPath = [];
            frequencies.forEach((frequency, index) => {
              if (Number(frequency) >= 30 && Number(frequency) <= 80) {
                currentPath.push(header[index]);
              } else {
                if (currentPath.length >= 3) {
                  parts.push(currentPath);
                }
                currentPath = [];
              }
            });

            if (parts.length > 0) {
              result.push({
                start: new LatLon(parseFloat(lat), parseFloat(lon)),
                azimuth: parseFloat(azimuth),
                time,
                parts,
              });
            }
          });

          setPoints((state) => ({
            ...state,
            [file.name]: result,
          }));
        }}
      >
        {({ getRootProps, acceptedFile }) => (
          <>
            <div>
              <button type="button" {...getRootProps()}>
                Browse file
              </button>
            </div>
          </>
        )}
      </CSVReader>
      <select
        value={distance}
        onChange={(e) => setDistance(Number(e.target.value))}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        zoom={6}
        onUnmount={onUnmount}
      />
    </>
  );
}

export default React.memo(MyComponent);
