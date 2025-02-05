import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { dbInstance } from '../firebaseConfig';

const useStyles = makeStyles((theme) => ({
  formRoot: {
    '& > *': {
      padding: theme.spacing(1),
     // width: '25ch',
    },
  },
  shortInput: {
    width: '100%'
  },
  deleteBtn: {
    marginRight: theme.spacing(1),
  },
  addBtn: {
    marginTop: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(0),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    minHeight: theme.classes.fixedHeightPaperMinHeight,
    height: theme.classes.fixedHeightPaper,
  },
  fixedHeightToolBar: {
    display: 'flex', 
    justifyContent:'flex-end', 
    alignItems:'center',
    height: theme.classes.fixedHeightPaperToolBar,
  },
  searchBar: {
    padding: theme.spacing(2),
  },
  duplicatedRecordsHolder: {
    display: 'flex',
  }
}));

export default function AdminScripts() {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false)
  const dbSalesInstance = dbInstance.collection("inventory_update_snapshots");

  const loadData = () => {
    setIsLoading(true)
    dbSalesInstance
      .where("branch", "==", 'rvJzHHXf7gNOW82nvMBX')
      .get()
      .then((querySnapshot) => {
        console.log('querySnapshot ', querySnapshot);
        let str = ''
        querySnapshot.forEach((doc) => {
          let dataObject = doc.data();
          console.log(doc.id)
          if (dataObject['save_snapshot']['R8hgzMkUh2MOXT5xnbXO']['amount'] !== 0) {
            str += `${dataObject['date']}\t${dataObject['save_snapshot']['R8hgzMkUh2MOXT5xnbXO']['amount']}\n`
          }
          
        });
        console.log(str)
        setIsLoading(false)
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
        setIsLoading(false)
      });
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Button
              variant="contained"
              color="primary"
              style={{ width: '200px' }}
              onClick={loadData}
            >
              load
            </Button>
          </Paper>
        </Grid>
       
      </Grid>
    </>
  );
}