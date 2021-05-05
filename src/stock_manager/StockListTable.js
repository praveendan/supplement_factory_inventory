import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { DataGrid } from '@material-ui/data-grid';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

export default function StockListTable({ stocks, setStocks, isLoading }) {
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const handleClickOpen = (currentItem) => {
    setCurrentItem(currentItem);
    setOpen(true);
  };

  const columns = [
    { field: "name", flex: 2, headerName: "Name" },
    { field: "categoryName", flex: 1, headerName: "Category" },
    { field: "note", flex: 1, headerName: "Note",
      valueGetter: getNoteText,
      sortComparator: (v1, v2, cellParams1, cellParams2) =>
      getNoteText(cellParams1).localeCompare(getNoteText(cellParams2))
    },
    {
      field: "numberOfItems", width: 150, headerName: "Stock", renderCell: (params) => (
        <StockNumberMapper {...params} />
      ),
    },
    {
      field: "tempNumberUpdate", width: 115, headerName: '# of items', renderCell: (params) => (
        <NumberUpdateCellRenderer stocks={stocks} setStocks={setStocks} rowIndex={params.rowIndex} {...params} />
      ),
    },
    {
      field: "id", width: 75, headerName: 'Action', disableColumnMenu: true, renderCell: (params) => (
        <ActionCellRenderer handleClickOpen={handleClickOpen} {...params} />
      ),
    },
  ];
  
  function getNoteText(params) {
    return `${params.row.note.text|| '-'}`
  }

  return (
    <>
      <div style={{ display: 'flex', flexGrow: 1, width: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid rows={stocks} columns={columns} loading={isLoading} />
        </div>
      </div>
      <SetNoteModal open={open} setOpen={setOpen} currentItem={currentItem} setCurrentItem={setCurrentItem} stocks={stocks} setStocks={setStocks} />
    </>
  );
}

const StockNumberMapper = (props) => {
  return props.row.tempNumberUpdate !== 0 ?
    `${props.value + props.row.tempNumberUpdate} items (before: ${props.value}) ${props.row.isUpdated === true ? "Updated just now" : ""}`
    : `${props.value} ${props.row.isUpdated === true ? "Updated just now" : ""}`
}

const NumberUpdateCellRenderer = (props) => {
  const setTempNumberUpdate = (e) => {
    let tempArray = props.stocks.slice();

    let itemIndex = tempArray.findIndex(element => element.id === props.row.id);

    if (itemIndex !== -1) {
      //checking if not a number. if it is a number, check for empty and then store the val
      tempArray[itemIndex].tempNumberUpdate = isNaN(e.target.value) ? 0 : e.target.value === "" ? 0 : parseInt(e.target.value);
      props.setStocks(tempArray);
    }
  }

  return (
    <React.Fragment>
      <Tooltip title="Enter the number of stock change">
        <TextField type="number" variant="outlined" size="small" value={props.row.tempNumberUpdate} onChange={setTempNumberUpdate} />
      </Tooltip>
    </React.Fragment>
  )
}

const ActionCellRenderer = (props) => {
  return (
    <IconButton aria-label="delete" onClick={() => props.handleClickOpen(props.row.id)}>
      <NoteAddIcon />
    </IconButton>
  )
}

const SetNoteModal = ({ open, setOpen, currentItem, setCurrentItem, stocks, setStocks }) => {
  const [note, setNote] = useState({
    is_predefined: false,
    text: ""
  });
  const [itemIndex, setItemIndex] = useState(-1);

  React.useEffect(() => {
    let tempArray = stocks.slice();
    let itemIndex = tempArray.findIndex(element => element.id === currentItem);
    setItemIndex(itemIndex);
    if (itemIndex !== -1) {
      setNote(tempArray[itemIndex].note);
    }

  }, [currentItem])

  const handleClose = () => {
    setCurrentItem(null);
    setOpen(false);
  };

  const handleChange = (event) => {
    if (event.target.value === "custom") {
      setNote({
        is_predefined: false,
        text: ""
      });
    } else {
      setNote({
        is_predefined: true,
        text: event.target.value
      });
    }
  }

  const handleTextChange = (event) => {
    setNote({
      is_predefined: false,
      text: event.target.value
    });
  }

  const setNoteForItem = () => {
    let tempArray = stocks.slice();
    
    if (itemIndex !== -1) {
      //checking if not a number. if it is a number, check for empty and then store the val
      tempArray[itemIndex].note = note;
      setStocks(tempArray);
    }
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Add Note</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Select a predefined note or add a custom note
        </DialogContentText>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="demo-simple-select-outlined-label">Note</InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={note.is_predefined === true ? note.text : "custom"}
            onChange={handleChange}
            label="Note"
          >
            <MenuItem value="custom">Custom</MenuItem>
            <MenuItem value="Sent back to Colombo">Sent back to Colombo</MenuItem>
          </Select>
        </FormControl>
        {
          note.is_predefined === false &&
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Your custom note"
            value={note.is_predefined === false ? note.text : ""}
            onChange={handleTextChange}
            fullWidth
          />
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={setNoteForItem} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}