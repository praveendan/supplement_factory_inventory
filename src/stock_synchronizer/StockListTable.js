import React, { useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { vars } from './../theme/theme';
import HistoryPerItemModal from './HistoryPerItemModal'

const ActionCellRenderer = ({currentStock, ...props}) => {
  return (
    <div style={{
      backgroundColor: (props.row.calculatedStock - currentStock[props.row.id] === 0)? "#b5ffa6" : "#ffa6a6"
    }}>
      <p>Current: {currentStock[props.row.id]} Diff {props.row.calculatedStock - currentStock[props.row.id]}</p>
    </div>

  )
}

const SalesRenderer = ({sales, setRecordsHistory, setShowModal, ...props}) => {
  const viewAllSalesOfProduct = () => {
    let total = 0
    const tempSales = []
    sales.forEach(element => {
      if(element[props.id]) {
        total += element[props.id]
        tempSales.push({
          readable_date: element.readable_date,
          amount: element[props.id]
        })
      }
    })

    setRecordsHistory({
      total,
      items: tempSales,
      name: props.row.name
    })
    
    setShowModal(true)
  }
  return (
    <p onClick={viewAllSalesOfProduct}>
      {props.row.totalSales}
    </p>
  )
}

const StockInRenderer = ({inventoryUpdates, setRecordsHistory, setShowModal, ...props}) => {
  const viewAllSalesOfProduct = () => {
    let total = 0
    const tempItemsIn = []
    inventoryUpdates.forEach(element => {
      if(element.save_snapshot[props.id]) {
        total += element.save_snapshot[props.id].amount
        if(element.save_snapshot[props.id].amount > 0) {
          tempItemsIn.push({
            readable_date: element.date,
            amount: element.save_snapshot[props.id].amount
          })
        }
      }
    })

    setRecordsHistory({
      total,
      items: tempItemsIn,
      name: props.row.name

    })

    setShowModal(true)
  }
  return (
    <p onClick={viewAllSalesOfProduct}>
      {props.row.totalStockIn}
    </p>
  )
}

export default function StockListTable({ currentStock, accumulatedStocksInOutData, sales, inventoryUpdates}) {
  const [ recordsHistory, setRecordsHistory] = useState({
    total: 0,
    items: [],
    name: ''
  })
  const [showModal, setShowModal] = useState(false)

  const columns = [
    { field: "name", flex: 2, headerName: "Name" },
    { field: "category", flex: 2, headerName: "Category" },
    { field: "totalSales", width: 130, headerName: "Sales", disableColumnMenu: true,  sortable: false, renderCell: (params) => (
      <SalesRenderer {...params} sales={sales} setRecordsHistory={setRecordsHistory} setShowModal={setShowModal}/>
    )},
    { field: "totalStockIn", width: 130, headerName: "Stocks in", disableColumnMenu: true,  sortable: false, renderCell: (params) => (
      <StockInRenderer {...params} inventoryUpdates={inventoryUpdates} setRecordsHistory={setRecordsHistory} setShowModal={setShowModal}/>
    )},
    { field: "calculatedStock", width: 130, headerName: "Calculated Stocks", disableColumnMenu: true,  sortable: false },
    { field: "id", flex: 2, headerName: 'Action', disableColumnMenu: true, sortable: false, renderCell: (params) => (
      <ActionCellRenderer {...params} currentStock={currentStock}/>
    )},
  ];
  

  return (
    <>
      <HistoryPerItemModal open={showModal} handleClose={() => setShowModal(false)} currentItemName={recordsHistory.name} total={recordsHistory.total} tableData={recordsHistory.items} />
      <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid rowHeight={vars.TABLE_ROW_HEIGHT} rows={accumulatedStocksInOutData} columns={columns} />
        </div>
      </div>
    </>
  );
}
