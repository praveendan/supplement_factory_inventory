import React from 'react';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import { DataGrid } from '@material-ui/data-grid';

export default function StockListTable({ rowData, setStocks, isLoading }) {
  const columns= [
    { field: "id", flex: 1, headerName: "Id" },
    { field: "name", flex: 2, headerName: "Name" },
    { field: "categoryName", flex: 2, headerName: "Category" },
    { field:"numberOfItems", flex: 2, headerName: "Stock", renderCell: (params) => (
      <StockNumberMapper {...params}/>
    ),},
    {
      field: "tempNumberUpdate", width: 200, headerName: 'Number of itemss', renderCell: (params) => (
        <ActionCellRenderer stocks={rowData} setStocks={setStocks} rowIndex={params.rowIndex} {...params}/>
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
  const setTempNumberUpdate = (e) => {
    let tempArray = props.stocks.slice();

    let itemIndex = tempArray.findIndex(element => element.id === props.row.id);

    if(itemIndex !== -1){
      //checking if not a number. if it is a number, check for empty and then store the val
      tempArray[itemIndex].tempNumberUpdate = isNaN(e.target.value)? 0 : e.target.value === ""? 0 : parseInt(e.target.value);
      props.setStocks(tempArray);
    }    
  }

  // const saveUpdate = async () => {
  //   let tempArray = props.stocks.slice();

  //   const result = await props.saveItemValue(props.stocks[props.rowIndex].id, tempArray[props.rowIndex].numberOfItems + tempArray[props.rowIndex].tempNumberUpdate);
  //   if (result === true) {
  //     setTempVal(0);
  //     tempArray[props.rowIndex].isUpdated = true;
  //     tempArray[props.rowIndex].numberOfItems = tempArray[props.rowIndex].numberOfItems + tempArray[props.rowIndex].tempNumberUpdate;
  //     tempArray[props.rowIndex].tempNumberUpdate = 0;

  //     props.setStocks(tempArray);
  //   }

  // }

  return (
    <React.Fragment>
      <Tooltip title="Enter the number of stock change">
        <TextField type="number" variant="outlined" size="small" value={props.row.tempNumberUpdate} onChange={setTempNumberUpdate}/>
      </Tooltip>
      {/* <Tooltip title="Save">
        <IconButton aria-label="save" onClick={saveUpdate}>
          <SaveIcon />
        </IconButton>
      </Tooltip> */}
    </React.Fragment>
  )
}