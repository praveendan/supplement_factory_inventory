import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { dbInstance } from './../firebaseConfig';

import Title from './../shared/Title'
import BranchListTable from './BranchListTable';

import Snackbar from './../shared/Notification'

// Generate Order Data
function createData(id, name) {
  return { id, name };
}

const useStyles = makeStyles((theme) => ({
  formRoot: {
    '& > *': {
      padding: theme.spacing(1),
    },
  },
  shortInput: {
    width: '100%'
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    minHeight: 500,
  },
  searchBar: {
    padding: theme.spacing(2),
  }
}));

export default function LogSales() {
  const classes = useStyles();
  const dbCollectionInstance = dbInstance.collection("branches");

  const [value, setValue] = React.useState('');
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  useEffect(() => {
    dbCollectionInstance.onSnapshot((snapshot) => {
      var branchList = [];
      snapshot.forEach((doc) => {
        branchList.push(createData(doc.id, doc.data().name))
      });
      setBranches(branchList);
      setIsLoading(false)
    }, (error) => {
      setNotification("Error retrieving data");
      setNotificationBarOpen(true);
      setNotificationSeverity("error");
      console.error("Error retirving info: ", error);
      setIsLoading(false)
    });
  },[])

  const addBranch = () => {
    let result = branches.filter(branch => branch.name.toLowerCase() == value.toLowerCase());
    if(result.length == 0) {
      dbCollectionInstance.add({
        name: value,
      })
      .then((_docRef) => { })
      .catch((_error) => {
        setNotification("Error adding branch");
        setNotificationBarOpen(true);
        setNotificationSeverity("error");
      });
    } else {
      setNotification("A branch with the same name exists");
      setNotificationBarOpen(true);
      setNotificationSeverity("warning");
    }
  }

  const deleteFunction = (branch)  => {
    dbCollectionInstance.doc(branch.id).delete().then(() => {
      setNotification(`The branch ${branch.name} has been deleted successfully`);
      setNotificationBarOpen(true);
      setNotificationSeverity("success");
    }).catch((error) => {
      setNotification(`Error deleting branch ${branch.name}`);
      setNotificationBarOpen(true);
      setNotificationSeverity("error");
    });
  }

  return (
    <>
      <Title>Branch Manager</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <TextField className={classes.shortInput} id="branch-name" onChange={(e) => setValue(e.target.value)} label="Branch name" variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Button className={classes.shortInput} onClick={addBranch} disabled={!value || value == ""? true: false} variant="contained" color="primary">
                  Add
                </Button>
              </Grid>
            </Grid> 
          </Paper>
        </Grid>   
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <BranchListTable rowData={branches} setBranches={setBranches} isLoading={isLoading} deleteFunction={deleteFunction}/>
          </Paper>
        </Grid>        
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>
    </>
  );
}
