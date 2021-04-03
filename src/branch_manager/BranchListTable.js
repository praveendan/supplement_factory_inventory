import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ConfirmationDialog from './../shared/ConfirmationDialog'

import { DataGrid } from '@material-ui/data-grid';

export default function BranchListTable({ rowData, setBranches, isLoading, deleteFunction }) {

  const columns = [
  //  { field: 'id', flex: 1, headerName: 'ID' },
    { field: 'name', flex: 2, headerName: 'Branch name' },
    {
      field: "", width: 100, headerName: 'Action', renderCell: (params) => (
        <DeleteButton branches={rowData} setBranches={setBranches} rowIndex={params.rowIndex} deleteFunction={deleteFunction} {...params}/>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', height: 400, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rows={rowData} columns={columns} pageSize={5} loading={isLoading}/>
      </div>
    </div>
  );
}

const DeleteButton = (props) => {
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null)

  const showPrompt = (item) => {
    setCurrentItem(item.row);
    setOpen(true);
  }

  const removeItem = () => {
    props.deleteFunction(currentItem)
  }
  return (

    <React.Fragment>
      <IconButton aria-label="delete" onClick={() => showPrompt(props)}>
        <DeleteIcon />
      </IconButton>
      <ConfirmationDialog
        id="delete-branch-confirmation"
        keepMounted
        label={currentItem && currentItem.name? currentItem.name :""}
        open={open}
        onConfirm={() => removeItem()}
        onClose={() => setOpen(false)}
        value={"dummy val"}
      />
    </React.Fragment>
  )
}