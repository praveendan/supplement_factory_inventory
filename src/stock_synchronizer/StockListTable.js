import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { vars } from './../theme/theme';

const ActionCellRenderer = ({currentStock, ...props}) => {
  return (
    <div style={{
      backgroundColor: (props.row.calculatedStock - currentStock[props.row.id] === 0)? "#b5ffa6" : "#ffa6a6"
    }}>
      <p>Current: {currentStock[props.row.id]} Diff {props.row.calculatedStock - currentStock[props.row.id]}</p>
    </div>

  )
}

export default function StockListTable({ currentStock, accumulatedStocksInOutData}) {

  const columns = [
    { field: "name", flex: 2, headerName: "Name" },
    { field: "category", flex: 2, headerName: "Category" },
    { field: "totalSales", width: 130, headerName: "Sales", disableColumnMenu: true,  sortable: false },
    { field: "totalStockIn", width: 130, headerName: "Stocks in", disableColumnMenu: true,  sortable: false },
    { field: "calculatedStock", width: 130, headerName: "Calculated Stocks", disableColumnMenu: true,  sortable: false },
    { field: "id", flex: 2, headerName: 'Action', disableColumnMenu: true, sortable: false, renderCell: (params) => (
      <ActionCellRenderer {...params} currentStock={currentStock}/>
    )},
  ];
  

  return (
    <>
      <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid rowHeight={vars.TABLE_ROW_HEIGHT} rows={accumulatedStocksInOutData} columns={columns} />
        </div>
      </div>
    </>
  );
}
