import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { dbInstance } from './../firebaseConfig';

import Title from '../shared/Title'
import StockListTable from './StockListTable';
import Snackbar from './../shared/Notification'

import { ReferenceDataContext } from "./../ReferenceDataContext"

// Generate Order Data
function createData(id, name, categoryName , numberOfItems) {
  return { id, name, categoryName, numberOfItems, tempNumberUpdate: 0, isUpdated: false };
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

export default function LogSales() {
  const classes = useStyles();

  const dbInventoryInstance =  dbInstance.collection("inventory");

  const [currentStockBranch, setCurrentStockBranch] = useState('');
  const [stocks, setStocks] = useState([]);

  const [productsObject, setProductsObject] = useState({});
  const { branchesObject } = useContext(ReferenceDataContext);
  const { categoriesObject } = useContext(ReferenceDataContext);
  const [isLoading, setIsLoading] = useState(false);

  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

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
      setNotification("Error retrieving product data. Please try again later.");
      setNotificationBarOpen(true);
      setNotificationSeverity("error");
      console.log("Error getting documents:", error);
    });
  },[])

  useEffect(() => {
    if(currentStockBranch && currentStockBranch !== "") {
      setIsLoading(true);
      dbInventoryInstance.doc(currentStockBranch).get()
      .then((doc) => {
        if (doc.exists) {
          var data = doc.data();
          var itemArray = [];
          Object.keys(data).map((d, _key) => {
            itemArray.push(createData(d, productsObject[d].name, categoriesObject[productsObject[d].category].name, data[d]))
          });
          setStocks(itemArray);
        } else {
          setNotification("Error loading data. If you have just created the branch, Please try again later.");
          setNotificationBarOpen(true);
          setNotificationSeverity("error");
          console.log("No such document!");
        }
        setIsLoading(false);
      }).catch((error) => {
        setNotification("Error retrieving data. Please try again later.");
        setNotificationBarOpen(true);
        setNotificationSeverity("error");
        console.log("Error getting document:", error);
        setIsLoading(false);
      });
    }
  },[currentStockBranch])

  return (
    <>
      <Title>Stock Manager</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
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
                      Object.keys(branchesObject).length === 0 && 
                      Object.keys(categoriesObject).length === 0
                    }
                    value={currentStockBranch}
                    onChange={(e) => setCurrentStockBranch(e.target.value)}
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
            <StockListTable rowData={stocks} setStocks={setStocks} isLoading={isLoading}/>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>
    </>
  );
}
