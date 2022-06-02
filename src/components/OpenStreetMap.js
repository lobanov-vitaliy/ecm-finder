import { useMemo } from "react";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import LatLon from "geodesy/latlon-ellipsoidal-vincenty.js";

const center = [49.388435, 30.939399];
const zoom = 6;

const App = ({ points = [], distance = 5 }) => {
  const polylines = useMemo(() => {
    return points.map(({ lat, lon, azimuth }) => {
      const start = new LatLon(parseFloat(lat), parseFloat(lon));
      const end = start.destinationPoint(distance * 1000, parseFloat(azimuth));

      return {
        id: (Math.random() + 1).toString(36).substring(7),
        from: [start.lat, start.lon],
        to: [end.lat, end.lon],
      };
    });
  }, [points, distance]);

  return (
    <>
      <MapContainer
        style={{ height: "100%", width: "100wh" }}
        zoom={zoom}
        center={center}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polylines.map(({ id, from, to }) => {
          return (
            <Polyline
              key={id}
              pathOptions={{ color: "red", stroke: 1 }}
              positions={[from, to]}
            />
          );
        })}
      </MapContainer>
    </>
  );
};

export default App;
