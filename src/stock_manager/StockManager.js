import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { dbInstance, functions } from './../firebaseConfig';

import Title from '../shared/Title';
import StockListTable from './StockListTable';
import Snackbar from './../shared/Notification';
import DatePicker from '../shared/Datepicker'

import { ReferenceDataContext } from "./../ReferenceDataContext"

// Generate Order Data
function createData(id, name, categoryName , numberOfItems, tempNumberUpdate=0, note={
  is_predefined: false,
  text: ""
}) {
  return { id, name, categoryName, numberOfItems, tempNumberUpdate, isUpdated: false, note };
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
  const dbInventoryUpdateInstance =  dbInstance.collection("inventory_update_snapshots");

  const [currentStockBranch, setCurrentStockBranch] = useState('');
  const [currentDate, setcurrentDate] = useState("");

  //stocks array for the table
  const [stocks, setStocks] = useState([]);

  const [productsObject, setProductsObject] = useState({});
  const { branchesObject } = useContext(ReferenceDataContext);
  const { categoriesObject } = useContext(ReferenceDataContext);
  const [isLoading, setIsLoading] = useState(false);

  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);

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
      showNotificationMessage("error", "Error retrieving product data. Please try again later.");
      console.log("Error getting documents:", error);
    });
  },[])

  useEffect(() => {
    if(currentDate &&
      currentDate !== "" &&
      currentStockBranch && 
      currentStockBranch !== "" && 
      0 < Object.keys(productsObject).length &&
      0 < Object.keys(categoriesObject).length) {
      setIsLoading(true);
      dbInventoryInstance.doc(currentStockBranch).get()
      .then(async (doc) => {
        if (doc.exists) {
          var data = doc.data();
          var updateInformationOftheBranchDate = {};
          await dbInventoryUpdateInstance.where("date", "==", currentDate).where("branch", "==", currentStockBranch)
          .limit(1)
          .get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              console.log(querySnapshot.docs[0].id);
              updateInformationOftheBranchDate = querySnapshot.docs[0].data().save_snapshot;
            }
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          });

          var itemArray = [];
          Object.keys(data).forEach(d => {
            let stockBeforeUpdate = (updateInformationOftheBranchDate[d] && updateInformationOftheBranchDate[d].amount)? data[d] -= updateInformationOftheBranchDate[d].amount : data[d];
            let productName = "Not available";
            let catName = "Not available";
            if(productsObject[d]) {
              productName = productsObject[d].name;
              catName = categoriesObject[productsObject[d].category]? categoriesObject[productsObject[d].category].name : "Not available"
            }
            itemArray.push(
              createData(d, 
                productName, 
                catName, 
                stockBeforeUpdate, 
                updateInformationOftheBranchDate[d] && updateInformationOftheBranchDate[d].amount? updateInformationOftheBranchDate[d].amount: 0,
                updateInformationOftheBranchDate[d]? updateInformationOftheBranchDate[d].note : { is_predefined: false,text: "" }
                ))
          });
          setStocks(itemArray);
        } else {
          showNotificationMessage("error", "Error loading data. If you have just created the branch, Please try again later.");
          console.log("No such document!");
        }
        setIsLoading(false);
      }).catch((error) => {
        showNotificationMessage("error", "Error retrieving data. Please try again later.");
        console.log("Error getting document:", error);
        setIsLoading(false);
      });
    }
  },[currentStockBranch, currentDate]);

  const showNotificationMessage = (severety, message) => {
    setNotification(message);
    setNotificationBarOpen(true);
    setNotificationSeverity(severety);
  }

  const savelog = () => {
    if(currentStockBranch && currentStockBranch !== "" &&
    currentDate && currentDate !== ""){
      setIsSaveButtonDisabled(true);
      let stocksUpdateObject = {};
      let updateSnapshot = {};
      stocks.forEach(element => {
        updateSnapshot[element.id] = {
          amount: element.tempNumberUpdate,
          note: element.note
        };
        stocksUpdateObject[element.id] = element.numberOfItems + element.tempNumberUpdate;   
      });

      let inventoryUpdateSnapshot = {
        branch: currentStockBranch,
        date: currentDate,
        save_snapshot:updateSnapshot
      };

      let data = {
        branch : currentStockBranch,
        stocksUpdateObject,
        inventoryUpdateSnapshot
      }

      var addLog = functions.httpsCallable('updateInventory');
      addLog(data)
      .then((result) => {
        // Read result of the Cloud Function.
        if(result.data.status === "SUCCESS"){
          setIsSaveButtonDisabled(false);
          showNotificationMessage("success", "Saved the log and updated inventory successfully.")
        } else {
          showNotificationMessage("error", result.data.message? result.data.message : "Error saving data.")
        }
        
      })
      .catch((error) => {
        var code = error.code;
        var message = error.message;
        showNotificationMessage("error", `Error: ${message} Code: ${code}`)
      });
    }
  }

  return (
    <>
      <Title>Stock Manager</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
                <DatePicker className={classes.shortInput} currentDate={currentDate}
                  disabled={
                    Object.keys(productsObject).length === 0 && 
                    Object.keys(branchesObject).length === 0 && 
                    Object.keys(categoriesObject).length === 0
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
            <StockListTable stocks={stocks} setStocks={setStocks} isLoading={isLoading}/>
            <div style={{display: 'grid', justifyContent:'flex-end'}}>
              <Button 
                className={classes.shortInput} 
                variant="contained" 
                color="primary"
                style={{width: '200px'}}
                disabled={stocks.length === 0 || isSaveButtonDisabled}
                onClick={savelog}
                >
                Save
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>
    </>
  );
}
