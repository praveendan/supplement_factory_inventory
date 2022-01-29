import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { dbInstance } from './../firebaseConfig';

import StockListTable from './StockListTable';
import Snackbar from './../shared/Notification';
import DatePicker from '../shared/Datepicker'

import { ReferenceDataContext } from "./../ReferenceDataContext"

import generatePDF from './GeneratePDF'

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
  downloadButton: { 
    marginRight: theme.spacing(1),
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
  const [isSaving, setIsSaving] = useState(false);

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
              updateInformationOftheBranchDate = querySnapshot.docs[0].data().save_snapshot;
            }
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          });

          var itemArray = [];
          Object.keys(data).forEach(d => {
            let stockBeforeUpdate = (updateInformationOftheBranchDate[d] && updateInformationOftheBranchDate[d].amount)? data[d] -= updateInformationOftheBranchDate[d].amount : data[d];
  
            if(productsObject[d] && productsObject[d].name) {
              const productName = productsObject[d].name;
              const catName = categoriesObject[productsObject[d].category]? categoriesObject[productsObject[d].category].name : "Not available";
              itemArray.push(
                createData(d, 
                  productName, 
                  catName, 
                  stockBeforeUpdate, 
                  updateInformationOftheBranchDate[d] && updateInformationOftheBranchDate[d].amount? updateInformationOftheBranchDate[d].amount: 0,
                  updateInformationOftheBranchDate[d]? updateInformationOftheBranchDate[d].note : { is_predefined: false,text: "" }
                  ))
            }
            
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
    } else {
      setStocks([]);
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
      setIsSaving(true);
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

      dbInventoryUpdateInstance
        .where("date", "==", inventoryUpdateSnapshot.date)
        .where("branch", "==", currentStockBranch)
        .limit(1)
        .get()
        .then(async (querySnapshot) => {
          if (!querySnapshot.empty) {
            const snapShotId = querySnapshot.docs[0].id;
            try {
              await dbInventoryUpdateInstance.doc(snapShotId).set(inventoryUpdateSnapshot);
              console.log(`${currentStockBranch}-${inventoryUpdateSnapshot.date} written`);
              showNotificationMessage("success", "Saved the log and updated inventory successfully.");
              setIsSaveButtonDisabled(false);
              setIsSaving(false);
            } catch (error) {
              console.error(`${currentStockBranch}-${inventoryUpdateSnapshot.date} not written`, error);
              showNotificationMessage("error", error.message? error.message : "Error saving data.");
            }
          } else {
            try {
              await dbInventoryUpdateInstance.add(inventoryUpdateSnapshot);
              console.log(`${currentStockBranch}-${inventoryUpdateSnapshot.date} added`);
              showNotificationMessage("success", "Saved the log and updated inventory successfully.");
              setIsSaveButtonDisabled(false);
              setIsSaving(false);
            } catch (error) {
              console.error(`${currentStockBranch}-${inventoryUpdateSnapshot.date} not added`, error);
              showNotificationMessage("error", error.message? error.message : "Error saving data.")
            }
          }
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
          showNotificationMessage("error", error.message? error.message : "Error getting documents")
        });
    }
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <fieldset  className={clsx(classes.searchBar, "MuiPaper-elevation1",  "MuiPaper-rounded", "paper-looking-fieldset")}>
            <legend className="paper-looking-fieldset-legend">Stock Manager</legend>
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
          </fieldset>
        </Grid>
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <StockListTable stocks={stocks} setStocks={setStocks} isLoading={isLoading}/>
            <div className={classes.fixedHeightToolBar}>
            <Button
              variant="contained" 
              color="secondary"
              className={classes.downloadButton}
              disabled={stocks.length === 0 }
              onClick={() => generatePDF(stocks,branchesObject[currentStockBranch].name)}
            >
              Download stocks
            </Button>
              <Button 
                variant="contained" 
                color="primary"
                style={{width: '200px'}}
                disabled={stocks.length === 0 || isSaveButtonDisabled}
                onClick={savelog}
                >
                {isSaving? "Saving...": "Save"}
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>
    </>
  );
}
