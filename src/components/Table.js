import { Checkbox } from "antd";
import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import { MultiGrid } from "react-virtualized";
import { AutoSizer } from "react-virtualized";

const STYLE_BOTTOM_LEFT_GRID = {
  borderRight: "2px solid #e8e8e8",
};
const STYLE_TOP_LEFT_GRID = {
  borderBottom: "2px solid #e8e8e8",
  borderRight: "2px solid #e8e8e8",
};
const STYLE_TOP_RIGHT_GRID = {
  borderBottom: "2px solid #e8e8e8",
};

const TableComponent = ({ range, data = [], selected, onSelected }) => {
  const header = useMemo(() => {
    const [header = []] = data || [];
    return header;
  }, [data]);

  const onSelectRow = (id, checked) => {
    if (checked) {
      onSelected([...selected, id]);
    } else {
      onSelected(selected.filter((index) => index !== id));
    }
  };

  const cellRenderer = useCallback(
    ({ columnIndex, key, rowIndex, style }) => {
      const value =
        ((data[rowIndex].columns || [])[columnIndex - 1] || {}).value || "";
      return (
        <div
          key={key}
          className={classNames("table-cell", {
            "table-cell-header": rowIndex === 0,
            "table-cell-range":
              rowIndex !== 0 &&
              columnIndex > 4 &&
              range.min <= Number(value) &&
              range.max >= Number(value),
          })}
          style={style}
        >
          {(() => {
            if (columnIndex === 0) {
              if (rowIndex === 0) {
                return "#";
              }
              return rowIndex;
            }
            if (columnIndex === 1) {
              if (rowIndex !== 0) {
                return (
                  <Checkbox
                    checked={selected.includes(data[rowIndex].id)}
                    onChange={(e) =>
                      onSelectRow(data[rowIndex].id, e.target.checked)
                    }
                  />
                );
              }
              return null;
            }

            return value;
          })()}
        </div>
      );
    },
    [data, selected, range]
  );

  return (
    <AutoSizer>
      {({ width, height }) => (
        <MultiGrid
          cellRenderer={cellRenderer}
          columnWidth={({ index }) => {
            if (index === 0) {
              return 50;
            }

            if (index === 1) {
              return 30;
            }

            return 80;
          }}
          columnCount={header.columns.length + 2}
          fixedColumnCount={5}
          fixedRowCount={1}
          enableFixedColumnScroll
          enableFixedRowScroll
          height={height}
          rowHeight={30}
          rowCount={data.length}
          width={width}
          styleBottomLeftGrid={STYLE_BOTTOM_LEFT_GRID}
          styleTopLeftGrid={STYLE_TOP_LEFT_GRID}
          styleTopRightGrid={STYLE_TOP_RIGHT_GRID}
          hideTopRightGridScrollbar
          hideBottomLeftGridScrollbar
        />
      )}
    </AutoSizer>
  );
};

export default TableComponent;
