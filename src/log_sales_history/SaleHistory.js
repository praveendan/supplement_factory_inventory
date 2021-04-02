import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import Title from '../shared/Title'
import SaleHistoryListTable from './SaleHistoryTable';
import DatePicker from '../shared/Datepicker'

import { dbInstance } from './../firebaseConfig';
import { ReferenceDataContext } from "./../ReferenceDataContext"
import Snackbar from './../shared/Notification'

// Generate Order Data
function createData(id, name, numberOfItems) {
  return { id, name, numberOfItems };
}

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

export default function SaleHistory() {
  const classes = useStyles();
  const [currentDate, setcurrentDate] = useState("");
  const [currentBranch, setCurrentBranch] = React.useState('');
  const dbSalesInstance = dbInstance.collection("sales");

  const [productsObject, setProductsObject] = useState({});
  const { branchesObject } = useContext(ReferenceDataContext);

  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

  const [saleHistory, setSaleHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const dbProductInstance = dbInstance.collection("products");

    dbProductInstance.get()
      .then((querySnapshot) => {
        var productList = {};
        querySnapshot.forEach((doc) => {
          productList[doc.id] = {
            name: doc.data().name,
            category: doc.data().category
          }
        });
        setProductsObject(productList);
      })
      .catch((error) => {
        showNotificationMessage("error", "Error retrieving product data. Please try again later.")
        console.log("Error getting documents:", error);
      });
  }, []);

  useEffect(() => {
    if (currentDate && currentDate !== "" && currentBranch && currentBranch !== "") {
      setIsLoading(true);
      dbSalesInstance.doc(currentDate).get()
        .then((doc) => {
          if (doc.exists) {
            var tempArray = [];
            let dataObject = doc.data()[currentBranch];
            if (dataObject) {
              Object.keys(dataObject).forEach((d) => {
                tempArray.push(createData(d, productsObject[d].name, dataObject[d]))
              });
            }
            setSaleHistory(tempArray);
            setIsLoading(false);
          } else {
            setSaleHistory([]);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.log("Error retrieving data: ", error);
          showNotificationMessage("error", "Error retrieving data. Please try again later.")
          setSaleHistory([]);
          setIsLoading(false);
        });
    }
  }, [currentDate, currentBranch])

  const showNotificationMessage = (severety, message) => {
    setNotification(message);
    setNotificationBarOpen(true);
    setNotificationSeverity(severety);
  }

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <>
      <Title>Sale History</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <DatePicker className={classes.shortInput} currentDate={currentDate}
                  disabled={
                    Object.keys(productsObject).length === 0 &&
                    Object.keys(branchesObject).length === 0
                  }
                  setcurrentDate={setcurrentDate} />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <FormControl className={classes.shortInput} variant="outlined" size="small">
                  <InputLabel htmlFor="category-selector">Branch</InputLabel>
                  <Select
                    native
                    label="Branch"
                    inputProps={{
                      name: 'branch',
                      id: 'branch-selector',
                    }}
                    disabled={
                      Object.keys(productsObject).length === 0 &&
                      Object.keys(branchesObject).length === 0
                    }
                    value={currentBranch}
                    onChange={(e) => setCurrentBranch(e.target.value)}
                  >
                    <option aria-label="None" value="" />
                    {Object.keys(branchesObject).map((d, _key) => (<option key={d} value={d}>{branchesObject[d].name}</option>))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <SaleHistoryListTable rowData={saleHistory} setSaleHistorys={setSaleHistory} isLoading={isLoading}/>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification} />
    </>
  );
}
