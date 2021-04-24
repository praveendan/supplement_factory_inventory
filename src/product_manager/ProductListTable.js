import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ConfirmationDialog from './../shared/ConfirmationDialog'

import { DataGrid } from '@material-ui/data-grid';

export default function ProductListTable({ rowData, isLoading, categoriesList, deleteFunction }) {
  const columns= [
   // { field: "id", flex: 1, headerName: "Id" },
    { field: "name", flex: 2, headerName: "Product name" },
    { field:"category", flex: 2, headerName: "Product category", renderCell: (params) => (
      <ProductCategoryMapper categoriesList={categoriesList} {...params}/>
    ),},
    {
      field: "id", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer deleteFunction={deleteFunction} {...params}/>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rows={rowData} columns={columns} categoriesList={categoriesList} loading={isLoading}/>
      </div>
    </div>
  );
}

const ProductCategoryMapper = (props) => {
  return (
    props.categoriesList && props.categoriesList[props.value] && props.categoriesList[props.value].name? 
    props.categoriesList[props.value].name : "Deleted category"
  )
}

const ActionCellRenderer = (props) => {
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState("")

  const showPrompt = (item) => {
    setCurrentItem(item);
    setOpen(true);
  }

  const removeItem = () => {
    props.deleteFunction(currentItem);
  }

  return (
    <React.Fragment>
      <IconButton aria-label="delete" onClick={() => showPrompt(props.row)}>
        <DeleteIcon />
      </IconButton>
      <ConfirmationDialog
        id="delete-product-confirmation"
        keepMounted
        label={currentItem && currentItem.name? `delete ${currentItem.name}? this can't be undone` :""}
        open={open}
        onConfirm={() => removeItem()}
        onClose={() => setOpen(false)}
        value={"dummy val"}
      />
    </React.Fragment>
  )
}