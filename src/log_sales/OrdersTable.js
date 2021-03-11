import React, { useState, useEffect } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { DataGrid } from '@material-ui/data-grid';

export default function OrdersTable({ saleItems, setSaleItems, ...props }) {
  console.log(saleItems)
  const columns = [
    {field: "saleItem", flex: 1, headerName: "Item" },
    {field: "saleNumberOfItems", flex: 2, headerName: "Number of items"},
    {field: "saleIsReturn", width: 150, headerName: "Is a return?", renderCell: (params) =>(
      params.value == false?  "NO": "YES"
    )},
    {
      field: "", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer saleItems={saleItems} setSaleItems={setSaleItems} rowIndex={params.rowIndex} />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', height: 400, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rows={saleItems} columns={columns} pageSize={5} />
      </div>
    </div>
  );
};

const ActionCellRenderer = (props) => {

  const removeItem = (index) => {
    var tempArray = props.saleItems.slice();
    tempArray.splice(index, 1);
    props.setSaleItems(tempArray)
  }

  return (
    <IconButton aria-label="delete" onClick={() => removeItem(props.rowIndex)}>
      <DeleteIcon />
    </IconButton>
  )
}