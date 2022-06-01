import { useEffect, useMemo, useState } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { useCSVReader } from "react-papaparse";
import { Button, Select, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import LatLon from "geodesy/latlon-ellipsoidal-vincenty.js";

const { Option } = Select;
const center = [49.388435, 30.939399];
const zoom = 6;

const Polylines = ({ lines = [] }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = [];

    lines.forEach(({ from, to }) => {
      bounds.push(from, to);
    });

    if (bounds.length) {
      map.fitBounds(bounds);
    }
  }, [lines, map]);

  return lines.map(({ id, from, to }) => {
    return (
      <Polyline
        key={id}
        pathOptions={{ color: "red", stroke: 1 }}
        positions={[from, to]}
      />
    );
  });
};

const App = () => {
  const { CSVReader } = useCSVReader();
  const [points, setPoints] = useState(null);
  const [distance, setDistance] = useState(5);

  const polylines = useMemo(() => {
    return Object.values(points || {})
      .flat()
      .map(({ point, azimuth }) => {
        const end = point.destinationPoint(distance * 1000, azimuth);

        return {
          id: (Math.random() + 1).toString(36).substring(7),
          from: [point.lat, point.lon],
          to: [end.lat, end.lon],
        };
      });
  }, [points, distance]);

  const onUploadAccepted = ({ data, errors }, file) => {
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
          point: new LatLon(parseFloat(lat), parseFloat(lon)),
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
  };

  return (
    <>
      <header>
        <Space>
          <CSVReader onUploadAccepted={onUploadAccepted}>
            {({ getRootProps }) => (
              <>
                <div>
                  <Button {...getRootProps()} icon={<UploadOutlined />}>
                    Browse file
                  </Button>
                </div>
              </>
            )}
          </CSVReader>

          <Space>
            <Select
              defaultValue="5"
              onChange={(value) => setDistance(Number(value))}
            >
              {[5, 10, 15, 20, 25, 50].map((value) => (
                <Option value={value}>{value}</Option>
              ))}
            </Select>
            <span>km</span>
          </Space>
          {points && (
            <Button type="link" onClick={() => setPoints(null)}>
              Clear
            </Button>
          )}
        </Space>
      </header>

      <MapContainer
        style={{ height: "calc(100% - 50px)", width: "100wh" }}
        zoom={zoom}
        center={center}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polylines lines={polylines} />
      </MapContainer>
    </>
  );
};

export default App;
