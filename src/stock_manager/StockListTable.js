import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import { DataGrid } from '@material-ui/data-grid';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function StockListTable({ rowData, saveItemValue, setStocks, isLoading }) {
  const classes = useStyles();
  const columns= [
    { field: "id", flex: 1, headerName: "Id" },
    { field: "name", flex: 2, headerName: "Name" },
    { field: "categoryName", flex: 2, headerName: "Category" },
    { field:"numberOfItems", flex: 2, headerName: "Stock", renderCell: (params) => (
      <StockNumberMapper {...params}/>
    ),},
    {
      field: "tempNumberUpdate", width: 200, headerName: 'Action', renderCell: (params) => (
        <ActionCellRenderer stocks={rowData} saveItemValue={saveItemValue} setStocks={setStocks} rowIndex={params.rowIndex} />
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

const StockNumberMapper = (props) => {
  return props.row.tempNumberUpdate !== 0 ? 
  `${props.value + props.row.tempNumberUpdate} items (before: ${props.value}) ${props.row.isUpdated === true ? "Updated just now":""}` 
  : `${props.value} ${props.row.isUpdated === true ? "Updated just now":""}` 
}

const ActionCellRenderer = (props) => {
  const [tempVal, setTempVal] = useState(0)

  const setTempNumberUpdate = (e) => {
    let tempArray = props.stocks.slice();
    setTempVal(isNaN(e.target.value)? 0 : e.target.value);
    tempArray[props.rowIndex].tempNumberUpdate = parseInt(isNaN(e.target.value)? 0 : e.target.value);
    props.setStocks(tempArray);
  }

  const saveUpdate = async () => {
    let tempArray = props.stocks.slice();

    const result = await props.saveItemValue(props.stocks[props.rowIndex].id, tempArray[props.rowIndex].numberOfItems + tempArray[props.rowIndex].tempNumberUpdate);
    if (result === true) {
      setTempVal(0);
      tempArray[props.rowIndex].isUpdated = true;
      tempArray[props.rowIndex].numberOfItems = tempArray[props.rowIndex].numberOfItems + tempArray[props.rowIndex].tempNumberUpdate;
      tempArray[props.rowIndex].tempNumberUpdate = 0;

      props.setStocks(tempArray);
    }

  }

  return (
    <React.Fragment>
      <Tooltip title="Enter the number of stock change">
        <TextField type="number" variant="outlined" size="small" value={tempVal} onChange={setTempNumberUpdate}/>
      </Tooltip>
      <Tooltip title="Save">
        <IconButton aria-label="save" onClick={saveUpdate}>
          <SaveIcon />
        </IconButton>
      </Tooltip>
    </React.Fragment>
  )
}