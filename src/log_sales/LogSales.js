import React, {useState, useEffect, useContext} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { dbInstance, functions } from './../firebaseConfig';

import DatePicker from '../shared/Datepicker'
import Title from './../shared/Title'
import Orders from './OrdersTable';
import ProductsDropDown from './../shared/ProductsDropdown'

import { ReferenceDataContext } from "./../ReferenceDataContext"

import Snackbar from './../shared/Notification'

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
    minHeight: 500,
  },
  searchBar: {
    padding: theme.spacing(2),
  }
}));

export default function LogSales() {
  const classes = useStyles();

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [currentDate, setcurrentDate] = useState("");
  const [currentBranch, setCurrentBranch] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [currentNumberOfItem, setCurrentNumberOfItem] = useState(0);
  const [currentReturnState, setCurrentReturnState] = useState(false);
  const [saleItems, setSaleItems] = useState([]);

  const [productsObject, setProductsObject] = useState({});
  const { branchesObject } = useContext(ReferenceDataContext);
  const dbSalesInstance = dbInstance.collection("sales");

  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

  const [inventoryUpdateSnapshot, setInventoryUpdateSnapshot] = useState({});

  const [isAddbuttonDisabled, setIsAddButtonDisabled] = useState(true);
  const [isSaveButtonDisabled, setIsSavebuttonDisabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(currentDate && currentDate !== "" && currentBranch && currentBranch !== "") {
      setIsLoading(true);
      dbSalesInstance.doc(currentDate).get()
      .then((doc) => {
        if (doc.exists) {
          var tempArray = [];
          let dataObject = doc.data()[currentBranch];
          if(dataObject){
            Object.keys(dataObject).forEach(d => {
              if(d !== "inventoryUpdateSnapshot"){
                tempArray.push({
                  id: d,
                  saleDate: currentDate,
                  saleBranch: currentBranch,
                  saleItem: productsObject[d]? productsObject[d].name: "Not available",
                  saleNumberOfItems: dataObject[d],
                  saleIsReturn: dataObject[d] < 0? true: false,
                  itemCode: d
                });
              }            
            });
          }          
          setSaleItems(tempArray);
          setIsLoading(false);
        } else {
          setSaleItems([])
          setIsLoading(false);
        }
        setIsAddButtonDisabled(false);
      })
      .catch((error) => {
        console.log("Error retrieving data: ", error);
        showNotificationMessage("error", "Error retrieving data. Please try again later.")
        setSaleItems([]);
        setIsLoading(false);
        setIsAddButtonDisabled(false);
      });
    }
  },[currentDate, currentBranch])

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
  },[]);

  const showNotificationMessage = (severety, message) => {
    setNotification(message);
    setNotificationBarOpen(true);
    setNotificationSeverity(severety);
  }

  const addItemToList = () => {
    var tempArray = saleItems.slice();
    const found = tempArray.findIndex(element => element.itemCode === currentItem.itemCode);
    //to update the array
    if(-1 === found){ 
      tempArray.push({
        id: currentItem.itemCode,
        saleDate: currentDate,
        saleBranch: currentBranch,
        saleItem: currentItem.itemName,
        saleNumberOfItems: currentReturnState? -currentNumberOfItem: currentNumberOfItem,
        saleIsReturn: currentReturnState,
        itemCode: currentItem.itemCode
      });
    } else {
      if(currentReturnState) {
        tempArray[found].saleNumberOfItems = tempArray[found].saleNumberOfItems - currentNumberOfItem;
      } else {
        tempArray[found].saleNumberOfItems = tempArray[found].saleNumberOfItems + currentNumberOfItem;
      }
      if(tempArray[found].saleNumberOfItems === 0){
        tempArray.splice(found, 1);
      }          
    }

    //to update the inventory Object
    let tempUpdateInventoryObject = {...inventoryUpdateSnapshot};
    let itemsChange;
    if(inventoryUpdateSnapshot[currentItem.itemCode]){     
      if(currentReturnState) {
        itemsChange = inventoryUpdateSnapshot[currentItem.itemCode] + currentNumberOfItem;
      } else {
        itemsChange = inventoryUpdateSnapshot[currentItem.itemCode] - currentNumberOfItem;
      }
    } else {
      if(currentReturnState) {
        itemsChange = currentNumberOfItem;
      } else {
        itemsChange = -currentNumberOfItem;
      }
    }

    tempUpdateInventoryObject[currentItem.itemCode] = itemsChange;
    setInventoryUpdateSnapshot(tempUpdateInventoryObject)

    setSaleItems(tempArray)
  }
  
  const setNumberOfItems = (e) => {
    if(e.target.value && e.target.value !== "")
      setCurrentNumberOfItem(parseInt(e.target.value));
    else 
      setCurrentNumberOfItem(0);
  }

  const saveLog = () => {
    setIsSaving(true);
    setIsSavebuttonDisabled(true);
    setIsAddButtonDisabled(true);
    let saveLogObject = {};
    saveLogObject.branch = currentBranch;
    saveLogObject.date = currentDate;

    let tempUpdateObject = {};
    saleItems.forEach(element => {
      tempUpdateObject[element.id] = element.saleNumberOfItems
    });
 
    saveLogObject.logSnapshot = tempUpdateObject;
    saveLogObject.inventoryUpdateSnapshot = inventoryUpdateSnapshot;

    var addLog = functions.httpsCallable('updateSaleLog');
    addLog(saveLogObject)
      .then((result) => {
        // Read result of the Cloud Function.
        if(result.data.status === "SUCCESS"){
          setIsSaving(false);
          setIsSavebuttonDisabled(false);
          setIsAddButtonDisabled(false);
          showNotificationMessage("success", "Saved the log and updated inventory successfully.")
        } else {
          showNotificationMessage("error", result.data.message? result.data.message : "Error saving data.")
        }
        
      })
      .catch((error) => {
        var code = error.code;
        var message = error.message;
        setIsSaving(false);
        showNotificationMessage("error", `Error: ${message} Code: ${code}`)
      });
  }

  // const clearLog = () => {
  //   dbSalesInstance.doc(currentDate).delete().then(() => {
  //     console.log("Document successfully deleted!");
  //   }).catch((error) => {
  //       console.error("Error removing document: ", error);
  //   });
  // }

  return (
    <>
      <Title>Log Sales</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={2}>
                <DatePicker className={classes.shortInput} currentDate={currentDate} 
                disabled={
                  Object.keys(productsObject).length === 0 && 
                  Object.keys(branchesObject).length === 0 
                }
                setcurrentDate={setcurrentDate}/>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <FormControl className={classes.shortInput} variant="outlined" size="small">
                  <InputLabel htmlFor="branch-selector">Branch</InputLabel>
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
              <Grid item xs={12} sm={6} lg={3}>
                <ProductsDropDown
                  productsObject={productsObject}
                  id="combo-box-demo"
                  className={classes.shortInput}
                  size="small"
                  setCurrentItem={setCurrentItem}
                />
              </Grid>
              <Grid item xs={12} sm={2} lg={2}>
                <TextField 
                className={classes.shortInput} 
                id="number-of-items" 
                variant="outlined" 
                label="Number of items"
                type="number"
                InputProps={{ inputProps: { min: 0} }}
                value={parseInt(currentNumberOfItem)}
                onChange={setNumberOfItems}
                size="small"/>
              </Grid>
              <Grid item xs={12} sm={2} lg={1}>
                <FormControl className={classes.shortInput} variant="outlined" size="small">
                  <InputLabel htmlFor="branch-selector">Is return?</InputLabel>
                  <Select
                    native
                    label="Return"
                    inputProps={{
                      name: 'return',
                      id: 'return-selector',
                    }}
                    value={currentReturnState}
                    onChange={(e) => setCurrentReturnState(e.target.value === 'true'? true: false)}
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2} lg={1}>
                <Button 
                className={classes.shortInput} 
                variant="contained" 
                color="primary"
                disabled={(currentDate === "" || currentBranch === "" || currentItem === null || currentNumberOfItem === 0 || isAddbuttonDisabled)? true: false}
                onClick={addItemToList}
                >
                  Add
                </Button>
              </Grid>
            </Grid> 
          </Paper>
        </Grid>   
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <Orders saleItems={saleItems} setSaleItems={setSaleItems} isLoading={isLoading}/>
            <div style={{display: 'flex', justifyContent:'flex-end', alignItems:'center', flexGrow: 1}}>
              <Button 
                className={classes.shortInput} 
                variant="contained" 
                color="primary"
                style={{width: '200px'}}
                disabled={saleItems.length === 0 || isSaveButtonDisabled}
                onClick={saveLog}
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