import React, { useState } from "react";
import Map from "./components/Map";
import Table from "./components/Table";
import { Button, Empty, InputNumber, Select, Space } from "antd";
import { useCSVReader } from "react-papaparse";
import {
  UploadOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from "@ant-design/icons";
import cn from "classnames";

const { Option } = Select;
const App = () => {
  const { CSVReader } = useCSVReader();
  const [data, setData] = useState([]);
  const [distance, setDistance] = useState(25);
  const [selected, setSelected] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState({
    min: 30,
    max: 80,
  });

  const onUploadAccepted = ({ data }) => {
    const rows = [];
    data.forEach((row) => {
      rows.push({
        id: (Math.random() + 1).toString(36).substring(7),
        columns: row.map((value) => {
          return { value };
        }),
      });
    });
    setData(rows);
    setSelected([]);
    setIsOpen(true);
  };
  return (
    <main>
      <div style={{ height: isOpen ? "50%" : "100%" }}>
        <Map
          isOpen={isOpen}
          distance={distance}
          points={data
            .filter(({ id }) => selected.includes(id))
            .map(({ columns }) => {
              const [, lat, lon, azimuth] = columns;
              return { lat: lat.value, lon: lon.value, azimuth: azimuth.value };
            })}
        />
        <div className="control-panel">
          <Space size={10} split="|">
            <Button
              shape="circle"
              onClick={() => setIsOpen(!isOpen)}
              icon={isOpen ? <CaretDownOutlined /> : <CaretUpOutlined />}
            />
            <CSVReader onUploadAccepted={onUploadAccepted}>
              {({ getRootProps }) => (
                <Button {...getRootProps()} icon={<UploadOutlined />}>
                  Browse file
                </Button>
              )}
            </CSVReader>

            <Select
              value={distance}
              onChange={(value) => setDistance(Number(value))}
            >
              {[5, 10, 15, 20, 25, 50, 100].map((value) => (
                <Option value={value}>{value} km</Option>
              ))}
            </Select>
            <Space>
              Range
              <InputNumber
                prefix="min"
                min={1}
                max={200}
                value={range.min}
                onChange={(value) => setRange({ ...range, min: value })}
              />
              -
              <InputNumber
                prefix="max"
                min={1}
                max={200}
                value={range.max}
                onChange={(value) => setRange({ ...range, max: value })}
              />
            </Space>
          </Space>
        </div>
      </div>
      <div
        className={cn("table-block", {
          "table-block-open": isOpen && data.length !== 0,
          "table-block-empty": isOpen && data.length === 0,
        })}
      >
        {data.length ? (
          <Table
            range={range}
            data={data}
            selected={selected}
            onSelected={setSelected}
          />
        ) : (
          <Empty />
        )}
      </div>
    </main>
  );
};

export default App;
