import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ConfirmationDialog from './../shared/ConfirmationDialog'

import { DataGrid } from '@material-ui/data-grid';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function ProductListTable({ rowData, setProducts }) {
  const classes = useStyles();

  const columns= [
    { field: "id", flex: 1, headerName: "Id" },
    { field: "name", flex: 2, headerName: "Product name" },
    { field:"category", flex: 2, headerName: "Product category", renderCell: (params) => (
      <ProductCategoryMapper {...params}/>
    ),},
    {
      field: "", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer products={rowData} setProducts={setProducts} rowIndex={params.rowIndex} />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', height: 400, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rows={rowData} columns={columns} pageSize={5} />
      </div>
    </div>
  );
}

const catMap = {
  whey_protein: {
    name : 'Whey protein'
  },
  creatine: {
    name : 'Creatine'
  },
}
const ProductCategoryMapper = (props) => {
  return (
    catMap[props.value].name
  )
}

const ActionCellRenderer = (props) => {

  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState("")

  const showPrompt = (index) => {
    setCurrentItem(index);
    setOpen(true);
  }

  const removeItem = () => {
    var tempArray = props.products.slice();
    tempArray.splice(currentItem, 1);
    props.setProducts(tempArray)
  }

  return (
    <React.Fragment>
      <IconButton aria-label="delete" onClick={() => showPrompt(props.rowIndex)}>
        <DeleteIcon />
      </IconButton>
      <ConfirmationDialog
        id="delete-product-confirmation"
        keepMounted
        label="Product"
        open={open}
        onConfirm={() => removeItem()}
        onClose={() => setOpen(false)}
        value={"dummy val"}
      />
    </React.Fragment>
  )
}