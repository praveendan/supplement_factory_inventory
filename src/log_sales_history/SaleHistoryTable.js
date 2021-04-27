import React from 'react';
import { DataGrid } from '@material-ui/data-grid';

export default function SaleHistoryListTable({ rowData, setStocks, isLoading }) {
  const columns= [
    { field: "name", flex: 2, headerName: "Name" },
    { field:"numberOfItems", flex: 1, headerName: "Total number of items"},
  ];

  return (
    <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rows={rowData} columns={columns} loading={isLoading}/>
      </div>
    </div>
  );
}
