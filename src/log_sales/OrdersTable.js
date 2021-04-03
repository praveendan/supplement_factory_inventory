import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { DataGrid } from '@material-ui/data-grid';

export default function OrdersTable({ saleItems, setSaleItems, isLoading, ...props }) {
  const columns = [
    {field: "saleItem", flex: 2, headerName: "Item" },
    {field: "saleNumberOfItems", flex: 1, headerName: "Change in number of items", renderCell: (params) => (
      params.value < 0 ? -params.value: params.value
    )},
    {field: "saleIsReturn", width: 200, headerName: "Inventory change?", renderCell: (params) =>(
      params.row.saleNumberOfItems < 0 ? "Add": "Reduce"
    )},
    {
      field: "id", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer saleItems={saleItems} setSaleItems={setSaleItems} rowIndex={params.rowIndex} {...params}/>
      ),
    },
  ];
  return (
    <div style={{ display: 'flex', height: 400, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rows={saleItems} columns={columns} pageSize={5} loading={isLoading}/>
      </div>
    </div>
  );
};

const ActionCellRenderer = (props) => {
  const removeItem = (e, id) => {
    e.preventDefault();
    var tempArray = props.saleItems.slice();

    let index = tempArray.findIndex((item) => item.id === id );

    tempArray.splice(index, 1);
    props.setSaleItems(tempArray)
  }

  return (
    <IconButton aria-label="delete" onClick={(e) => removeItem(e, props.row.id)}>
      <DeleteIcon />
    </IconButton>
  )
}