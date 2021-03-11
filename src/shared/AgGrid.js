import React, { useState, useEffect } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
//import { AllCommunityModules } from '@ag-grid-community/all-modules';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

export default function OrdersTable({ rowData, tableSettings, frameworkComponents, ...props }) {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  useEffect(() => {
    if(gridApi){
      gridApi.sizeColumnsToFit();
    }
  },[rowData])


  const tableOptions = {
   // modules: AllCommunityModules,
    columnDefs: columnDefs,
    defaultColDef: {
      //suppressSizeToFit: false,
    },
    components: frameworkComponents,
  }

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
  }

  const onFirstDataRendered = (params) => {
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="ag-theme-material" style={{ height: 400, width: "100%", overflow:'hidden' }}>
      <AgGridReact
        onGridReady={onGridReady}
        rowData={rowData}
        frameworkComponents={tableOptions.components}
        columnDefs={tableOptions.columnDefs}
        defaultColDef={tableOptions.defaultColDef}
        onFirstDataRendered={onFirstDataRendered.bind(this)}>
      </AgGridReact>
    </div>
  );
};

const ActionCellRenderer = (props) => {

  const removeItem = (index) => {
    var tempArray = props.rowData.slice();
    tempArray.splice(index, 1);
    props.setSaleItems(tempArray)
  }

  return (
    <IconButton aria-label="delete" onClick={() => removeItem(props.rowIndex)}>
      <DeleteIcon />
    </IconButton>
  )
}