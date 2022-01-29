import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import SaleHistoryListTable from './SaleHistoryTable';
import DatePicker from '../shared/Datepicker'

import { dbInstance } from './../firebaseConfig';
import { ReferenceDataContext } from "./../ReferenceDataContext"
import Snackbar from './../shared/Notification'
import { getInitialGridColumnsState } from '@material-ui/data-grid';

// Generate Order Data
function createData(id, name, numberOfItems) {
  return name? { id, name, numberOfItems } : null
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
    minHeight: theme.classes.fixedHeightPaperMinHeight,
    height: theme.classes.fixedHeightPaper,
  },
  searchBar: {
    padding: theme.spacing(2),
  }
}));

export default function SaleHistory() {
  const classes = useStyles();
  const [fromDate, setFromDate] = useState("");
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
    if (fromDate && fromDate !== "" && currentDate && currentDate !== "" && currentBranch && currentBranch !== "") {
      setIsLoading(true);
      
      var myDate = fromDate.split("-");
      var newDate = new Date( myDate[0], myDate[1] - 1, myDate[2]);
      const fromDateTimeStamp = newDate.getTime();

      myDate = currentDate.split("-");
      newDate = new Date( myDate[0], myDate[1] - 1, myDate[2]);

      const toDateTimeStamp = newDate.getTime();

      let countObject = {};

      dbSalesInstance.where("date", ">=", fromDateTimeStamp).where("date", "<=", toDateTimeStamp)
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if(data) {
            Object.keys(data).forEach(itemKey => {
              if(itemKey !== "date" &&
              itemKey !== "readable_date" &&
              itemKey !== "branch"
              ) {
                if(countObject[itemKey]){
                  countObject[itemKey] += data[itemKey];
                } else {
                  countObject[itemKey] = data[itemKey];
                }
              } 
            })
          }
          
        });
        
        let itemsArray = [];

        Object.keys(countObject).forEach(item => {
          if(productsObject[item] && productsObject[item].name) {
            itemsArray.push(createData(item, productsObject[item].name, countObject[item]));
          }
        })

        setSaleHistory(itemsArray);
        setIsLoading(false);
      });

    }
  }, [fromDate, currentDate, currentBranch])

  const showNotificationMessage = (severety, message) => {
    setNotification(message);
    setNotificationBarOpen(true);
    setNotificationSeverity(severety);
  }

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <fieldset  className={clsx(classes.searchBar, "MuiPaper-elevation1",  "MuiPaper-rounded", "paper-looking-fieldset")}>
            <legend className="paper-looking-fieldset-legend">Sale History</legend>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <DatePicker className={classes.shortInput} currentDate={fromDate} label="From"
                  disabled={
                    Object.keys(productsObject).length === 0 ||
                    Object.keys(branchesObject).length === 0
                  }
                  setcurrentDate={setFromDate} />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <DatePicker className={classes.shortInput} currentDate={currentDate} label="To"
                  disabled={
                    Object.keys(productsObject).length === 0 ||
                    Object.keys(branchesObject).length === 0
                  }
                  setcurrentDate={setcurrentDate} />
              </Grid>
              <Grid item xs={12} sm={12} lg={3}>
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
                      Object.keys(productsObject).length === 0 ||
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
          </fieldset>
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
