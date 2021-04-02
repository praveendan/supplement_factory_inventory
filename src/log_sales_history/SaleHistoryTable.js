import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { DataGrid } from '@material-ui/data-grid';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function SaleHistoryListTable({ rowData, setStocks, isLoading }) {
  const classes = useStyles();
  const columns= [
    { field: "id", flex: 1, headerName: "Id" },
    { field: "name", flex: 2, headerName: "Name" },
    { field:"numberOfItems", flex: 2, headerName: "Number of items"},
  ];

  return (
    <div style={{ display: 'flex', height: 400, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rows={rowData} columns={columns} pageSize={5} loading={isLoading}/>
      </div>
    </div>
  );
}
