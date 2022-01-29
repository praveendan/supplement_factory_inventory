import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import ConfirmationDialog from './../shared/ConfirmationDialog';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import clsx from 'clsx';

import { DataGrid } from '@material-ui/data-grid';

import { vars } from './../theme/theme';

export default function ProductListTable({ rowData, isLoading, categoriesList, deleteFunction, updateName, isEditingDisabled }) {
  const columns= [
   // { field: "id", flex: 1, headerName: "Id" },
    { 
      field: "name", flex: 2, headerName: "Product name", renderCell: (params) => (
        <NameCellRender rowData={rowData} updateName={updateName} isEditingDisabled={isEditingDisabled} {...params}/>
      )
    },
    { field:"category", flex: 1, headerName: "Product category", 
      valueGetter: getCategoryText,
    },
    {
      field: "id", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer deleteFunction={deleteFunction} isEditingDisabled={isEditingDisabled} {...params}/>
      ),
    },
  ];

  function getCategoryText(params) {
    return categoriesList && categoriesList[params.row.category] && categoriesList[params.row.category].name? 
    categoriesList[params.row.category].name : "Deleted category"
  }

  return (
    <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rowHeight={vars.TABLE_ROW_HEIGHT} rows={rowData} columns={columns} categoriesList={categoriesList} loading={isLoading}/>
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  cellRoot: {
    width: '100%', 
    display:'flex', 
    height: '100%', 
    justifyContent: 'space-between',
    alignItems: "center"
  },
  cellButtonContainer: {
    height: '100%', 
  },
  cellButtonInput: {
    flexGrow: 1
  },
  cellButtonInputError: {
    background: '#ff000047',
    border: '2px solid red',
    borderRadius: '7px'
  },
  cellButton: {
    float: 'right',
    padding: 0
  }
}));

const NameCellRender = ({rowData, value, updateName, isEditingDisabled, ...props}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isRecordExists, setIsRecordExists] = useState(false);
  const originalValue = value;
  const classes = useStyles();

  const changeValue = (e) => {
    setTempValue(e.target.value);

    let found = null;
    if(e.target.value.toLowerCase() !== value.toLowerCase()) {
      found = rowData.find(o => o.name.toLowerCase() === e.target.value.toLowerCase());
    }

    setIsRecordExists( found? true: false );
  }

  const saveEdit = () => {
    updateName(props.row.id, tempValue);
    setIsEditing(false);
  }

  const cancelEdit = () => {
    setTempValue(originalValue);
    setIsEditing(false);
    setIsRecordExists(false);
  }

  if (!isEditing) {
    return (
      <React.Fragment>
        <div className={classes.cellRoot}>
          <p style={{ margin: 0 }}>{value}</p>
          {
            !isEditingDisabled &&
            <IconButton className={classes.cellButton} aria-label="edit" onClick={() => setIsEditing(true)}>
              <EditIcon />
            </IconButton>
          }
        </div>
      </React.Fragment>
    )
  } else {
    return (
      <React.Fragment>
        <div className={classes.cellRoot}>
          <Tooltip title={isRecordExists? "Name is already in use" : ""}>
            <TextField className={isRecordExists? clsx(classes.cellButtonInput, classes.cellButtonInputError): classes.cellButtonInput} type="text" variant="outlined" size="small" value={tempValue} onChange={changeValue} />
          </Tooltip>
          <div className={classes.cellButtonContainer}>
            {
              !isEditingDisabled &&
              <React.Fragment>
                <IconButton className={classes.cellButton} aria-label="edit" onClick={cancelEdit}>
                  <CancelIcon />
                </IconButton>
                <IconButton className={classes.cellButton} aria-label="edit" onClick={saveEdit}>
                  <SaveIcon />
                </IconButton>
              </React.Fragment>
            }
          </div>  
        </div>
      </React.Fragment>
    )
  }



}

const ActionCellRenderer = ({isEditingDisabled, ...props}) => {
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState("");
  const classes = useStyles();

  const showPrompt = (item) => {
    setCurrentItem(item);
    setOpen(true);
  }

  const removeItem = () => {
    props.deleteFunction(currentItem);
  }

  return (
    <React.Fragment>
      {
        !isEditingDisabled &&
        <IconButton className={classes.cellButton} aria-label="delete" onClick={() => showPrompt(props.row)}>
          <DeleteIcon />
        </IconButton>
      }
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