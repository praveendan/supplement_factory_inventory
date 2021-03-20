import React, {useState, useEffect} from 'react';
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

export default function CategoryListTable({rowData, setCategories, isLoading, deleteFunction}) {
  const classes = useStyles();
  
  const columns = [
   // {field: "id", flex: 1, headerName: "ID" },
    {field: "name", flex: 2, headerName: "Category name"},
    {
      field: "", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer categories={rowData} setCategories={setCategories} rowIndex={params.rowIndex} />
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

const ActionCellRenderer = (props) => {

  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState("")

  const showPrompt = (item) => {
    setCurrentItem(item.categories[item.rowIndex]);
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
        id="delete-category-confirmation"
        keepMounted
        label={currentItem && currentItem.name? currentItem.name :""}
        open={open}
        onConfirm={()=>removeItem()}
        onClose={()=>setOpen(false)}
        value={"dummy val"}
      />
    </React.Fragment>
  )
}