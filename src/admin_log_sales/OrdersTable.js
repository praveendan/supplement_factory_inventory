import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { DataGrid } from '@material-ui/data-grid';
import { vars } from './../theme/theme';
import ConfirmationDialog from './../shared/ConfirmationDialog'

export default function OrdersTable({ saleItems, setSaleItems, isLoading, isEditable, removeItemFromLog, ...props }) {
  const columns = [
    { field: "saleItem", flex: 2, headerName: "Item" },
    {
      field: "saleNumberOfItems", width: 250, headerName: "Change in number of items", renderCell: (params) => (
        params.value < 0 ? -params.value : params.value
      )
    },
    {
      field: "saleIsReturn", width: 200, headerName: "Inventory change?", renderCell: (params) => (
        params.row.saleNumberOfItems < 0 ? "Add" : "Reduce"
      )
    },
    {
      field: "id", width: 100, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer saleItems={saleItems} setSaleItems={setSaleItems} rowIndex={params.rowIndex} isEditableButton={isEditable} removeItemFromLog={removeItemFromLog} {...params} />
      ),
    },
  ];
  return (
    <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rowHeight={vars.TABLE_ROW_HEIGHT} rows={saleItems} columns={columns} loading={isLoading} />
      </div>
    </div>
  );
};

const ActionCellRenderer = (props) => {
  const [open, setOpen] = React.useState(false);

  const removeItem = (id) => {
    setOpen(false);
    var tempArray = props.saleItems.slice();
    let index = tempArray.findIndex((item) => item.id === id);

    tempArray.splice(index, 1);
    props.setSaleItems(tempArray)
  }

  const removeItemFromLog = async (id) => {
    setOpen(false);
    let res = await props.removeItemFromLog(id);
    if (res === true) {
      removeItem(id)
    }
  }

  return (
    props.isEditableButton ? (
      <React.Fragment>
        <IconButton aria-label="delete" onClick={_ => {
          setOpen(true)
        }}>
          <DeleteIcon />
        </IconButton>
        <ConfirmationDialog
          label="remove the item from list?"
          open={open}
          onConfirm={() => removeItem(props.row.id)}
          onClose={() => setOpen(false)}
          value={"dummy val1"}
        />
      </React.Fragment>

    ) : (
      <React.Fragment>
        <IconButton aria-label="delete" onClick={_ => {
          setOpen(true)
        }}>
          <DeleteIcon />
        </IconButton>
        <ConfirmationDialog
          label="remove the item from list?"
          open={open}
          onConfirm={() => removeItemFromLog(props.row.id)}
          onClose={() => setOpen(false)}
          value={"dummy val2"}
        />
      </React.Fragment>
    )
  )
}