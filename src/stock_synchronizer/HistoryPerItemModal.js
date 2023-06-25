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
  },
  tableCellError: {
    border: "2px solid red"
  }
}));


const HistoryPerItemModal = ({ open, handleClose, currentItemName, total, tableData }) => {
  const classes = useStyles();
  const sortedTableData = tableData.sort((a, b) => new Date(a.readable_date) - new Date(b.readable_date))

  return (
    <Dialog
      maxWidth="md"
      onEntering={() => {}}
      aria-labelledby="confirmation-dialog-title"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle id="confirmation-dialog-title">{currentItemName}</DialogTitle>
      <DialogContent dividers>
        <table className={classes.table}>
          <tr>
            <th className={classes.tableCell}><div className={classes.tableHeadCell}>Date</div></th>
            <th className={classes.tableCell}><div>Number of items</div></th>
          </tr>
          {
            sortedTableData.map((item, i) => {
              const classNames = i < sortedTableData.length - 1 && item.readable_date === sortedTableData[i+1]? clsx(classes.tableCell, classes.tableCellError) : classes.tableCell
              return (
                <tr>
                  <td className={classNames}>{item.readable_date}</td>
                  <td className={clsx(classes.tableCell, classes.tableCellCenter)}>{item.amount}</td>
                </tr>
              )
            })
          }
          <tr>
            <th className={classes.tableCell}><div className={classes.tableHeadCell}>Total</div></th>
            <th className={clsx(classes.tableCell, classes.tableCellCenter)}><div>{total}</div></th>
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
