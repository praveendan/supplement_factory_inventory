import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  table: {
    borderCollapse: "collapse",
    width: "100%",
    border: "1px solid rgba(224, 224, 224, 1)"
  },
  tableCell: {
    borderBottom: "1px solid rgba(224, 224, 224, 1)",
    textAlign: "left",
    padding: "8px"
  },
  tableCellCenter: {
    textAlign: 'center'
  },
  tableHeadCell: {
    borderRight: "2px solid rgba(224, 224, 224, 1)",
  }
}));


const HistoryPerItemModal = ({ open, handleClose, currentItem, tableData }) => {
  const classes = useStyles();

  return (
    <Dialog
      maxWidth="md"
      onEntering={() => {}}
      aria-labelledby="confirmation-dialog-title"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle id="confirmation-dialog-title">{currentItem.name}</DialogTitle>
      <DialogContent dividers>
        <table className={classes.table}>
          <tr>
            <th className={classes.tableCell}><div className={classes.tableHeadCell}>Date</div></th>
            <th className={classes.tableCell}><div>Number of items</div></th>
          </tr>
          {
            tableData.sort((a, b) => a.date - b.date).map(item => {
              return (
                <tr>
                  <td className={classes.tableCell}>{item.readable_date}</td>
                  <td className={clsx(classes.tableCell, classes.tableCellCenter)}>{item.amount}</td>
                </tr>
              )
            })
          }
          <tr>
            <th className={classes.tableCell}><div className={classes.tableHeadCell}>Total</div></th>
            <th className={clsx(classes.tableCell, classes.tableCellCenter)}><div>{currentItem.numberOfItems}</div></th>
          </tr>
        </table>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HistoryPerItemModal;
