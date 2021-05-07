import React, {useState} from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ConfirmationDialog from './../shared/ConfirmationDialog'

import { DataGrid } from '@material-ui/data-grid';
import { vars } from './../theme/theme';

export default function CategoryListTable({rowData, setCategories, isLoading, deleteFunction}) {
  const columns = [
   // {field: "id", flex: 1, headerName: "ID" },
    {field: "name", flex: 2, headerName: "Category name"},
    {
      field: "", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer categories={rowData} setCategories={setCategories} rowIndex={params.rowIndex} deleteFunction={deleteFunction} {...params} />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rowHeight={vars.TABLE_ROW_HEIGHT} rows={rowData} columns={columns} loading={isLoading}/>
      </div>
    </div>
  );
}

const ActionCellRenderer = (props) => {
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState("")

  const showPrompt = (item) => {
    setCurrentItem(item);
    setOpen(true);
  }

  const removeItem = () => {
    props.deleteFunction(currentItem)
  }

  return (
    <React.Fragment>
      <IconButton aria-label="delete" onClick={() => showPrompt(props.row)}>
        <DeleteIcon />
      </IconButton>
      <ConfirmationDialog
        id="delete-category-confirmation"
        keepMounted
        label={currentItem && currentItem.name? `delete ${currentItem.name}? this can't be undone` :""}
        open={open}
        onConfirm={()=>removeItem()}
        onClose={()=>setOpen(false)}
        value={"dummy val"}
      />
    </React.Fragment>
  )
}