import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { vars } from './../theme/theme';
import HistoryPerItemModal from './HistoryPerItemModal';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';

export default function SaleHistoryListTable({ rowData, setStocks, isLoading, historyPerItem }) {
  const [currentItem, setCurrentItem] = React.useState({
    name:"",
    id: "",
    numberOfItems: 0
  });
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const columns= [
    { field: "name", flex: 2, headerName: "Name"},
    { field: "category", flex: 2, headerName: "Category"},
    { field: "numberOfItems", headerName: "#"},
    { field: "id", width: 75, headerName: "Action", disableColumnMenu: true, sortable: false, renderCell: (params) => 
      (
        <ActionCellRender setCurrentItem={setCurrentItem} setOpen={setOpen} {...params}/>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid rowHeight={vars.TABLE_ROW_HEIGHT} rows={rowData} columns={columns} loading={isLoading}/>
        {
          historyPerItem[currentItem.id] &&
          <HistoryPerItemModal 
            open={open}
            handleOpen={handleOpen}
            handleClose={handleClose}
            currentItem={currentItem}
            tableData={historyPerItem[currentItem.id]}/>
        }
        
      </div>
    </div>
  );
}

const ActionCellRender = ({value, setCurrentItem, setOpen, ...props}) => {
  const setItem = () => {
    setOpen(true);

    setCurrentItem({
      name: props.row.name,
      id: value,
      numberOfItems: props.row.numberOfItems
    })
  }

  return (
    <IconButton aria-label="delete" onClick={setItem} style={{padding: 0}}>
      <VisibilityIcon />
    </IconButton>
  )
}