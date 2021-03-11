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

export default function BranchListTable({ rowData, setBranches }) {

  const columns = [
    { field: 'id', flex: 1, headerName: 'ID' },
    { field: 'name', flex: 2, headerName: 'Branch name' },
    {
      field: "", width: 100, headerName: 'Action', renderCell: (params) => (
        <DeleteButton branches={rowData} setBranches={setBranches} rowIndex={params.rowIndex} />
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

const DeleteButton = (props) => {
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState("")

  const showPrompt = (index) => {
    setCurrentItem(index);
    setOpen(true);
  }

  const removeItem = () => {
    var tempArray = props.branches.slice();
    tempArray.splice(currentItem, 1);
    props.setBranches(tempArray)
  }

  return (
    <React.Fragment>
      <IconButton aria-label="delete" onClick={() => showPrompt(props.rowIndex)}>
        <DeleteIcon />
      </IconButton>
      <ConfirmationDialog
        id="delete-branch-confirmation"
        keepMounted
        label="Branch"
        open={open}
        onConfirm={() => removeItem()}
        onClose={() => setOpen(false)}
        value={"dummy val"}
      />
    </React.Fragment>
  )
}