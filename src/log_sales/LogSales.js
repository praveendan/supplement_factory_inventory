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
import ConfirmationDialog from './../shared/ConfirmationDialog'

import firebase from './../firebaseConfig';
import { dbInstance } from './../firebaseConfig';

import DatePicker from '../shared/Datepicker'
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

  const [isEditable, setIsEditable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const [currentDoc, setCurrentDoc] = useState("");

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

  useEffect(() => {
    if(currentDate && currentDate !== "" && currentBranch && currentBranch !== "") {
      setIsLoading(true);
      setIsEditable(true);

      dbSalesInstance
      .where("branch", "==", currentBranch)
      .where("readable_date", "==", currentDate)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        var tempArray = [];
        querySnapshot.forEach((doc) => {
          
          setCurrentDoc(doc.id);
          let dataObject = doc.data();

          Object.keys(dataObject).forEach(d => {
            if(d !== 'date' &&
              d !== 'readable_date' &&
              d !== 'branch'){
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
          setIsEditable(false);
        });
        setSaleItems(tempArray);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);

        console.log("Error retrieving data: ", error);
        showNotificationMessage("error", "Error retrieving data. Please try again later.")
        setSaleItems([]);
        setIsEditable(false)
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[currentDate, currentBranch])

  const showNotificationMessage = (severety, message) => {
    setNotification(message);
    setNotificationBarOpen(true);
    setNotificationSeverity(severety);
  }

  /* * if uneditable,  that means there is a record for that brnach and data
  * then it will update the db and the frontendArray on the fly
  * if not, it will update as a batch
  * */
  const addItemToList = async() => {
    var tempArray = saleItems.slice();
    const found = tempArray.findIndex(element => element.itemCode === currentItem.itemCode);
    if(isEditable){
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
      setSaleItems(tempArray);
    } else {
      setIsSaving(true);

      var update = {};

      if(-1 === found){ 
        update = {
          [currentItem.itemCode]: currentReturnState ? - currentNumberOfItem : currentNumberOfItem,
        };

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
          update = {
            [currentItem.itemCode]: tempArray[found].saleNumberOfItems - currentNumberOfItem
          }
          tempArray[found].saleNumberOfItems = tempArray[found].saleNumberOfItems - currentNumberOfItem;
        } else {
          update = {
            [currentItem.itemCode]: tempArray[found].saleNumberOfItems + currentNumberOfItem
          }
          tempArray[found].saleNumberOfItems = tempArray[found].saleNumberOfItems + currentNumberOfItem;
        }

        if(tempArray[found].saleNumberOfItems === 0){
          tempArray.splice(found, 1);
          update = {
            [currentItem.itemCode]: firebase.firestore.FieldValue.delete()
          }
        }          
      }

      dbSalesInstance
        .doc(currentDoc)
        .update(update)
        .then(_ => {
          setIsSaving(false);
          setSaleItems(tempArray);
        })
        .catch((error) => {
          setIsSaving(false);
          showNotificationMessage("error", error.message ? error.message : "Error saving data.");
        });
    }
    
  }

  const removeItemFromLog = (id) => {
    var tempArray = saleItems.slice();
    dbSalesInstance
    .doc(currentDoc)
    .update({
      [id]: firebase.firestore.FieldValue.delete()
    })
    .then(_ => {
      setIsSaving(false);
      setSaleItems(tempArray.filter(item => item.itemCode !== id));
    })
    .catch(error => {
      setIsSaving(false);
      showNotificationMessage("error", error.message? error.message : "Error saving data.");
    });
  }
  
  const setNumberOfItems = (e) => {
    if(e.target.value && e.target.value !== "")
      setCurrentNumberOfItem(parseInt(e.target.value));
    else 
      setCurrentNumberOfItem(0);
  }

  const saveLog = () => {
    setIsSaving(true);
    setOpen(false);

    let tempUpdateObject = {};
    saleItems.forEach(element => {
      tempUpdateObject[element.id] = element.saleNumberOfItems
    });
 
    const branch = currentBranch;
    const date = currentDate;

    const tempDate = date.split("-");
    var newDate = new Date(tempDate[0], tempDate[1] - 1, tempDate[2]);

    const logSnapshot = {
      branch: branch,
      date: newDate.getTime(),
      readable_date: date,
      ...tempUpdateObject
    }

    dbSalesInstance
    .add(logSnapshot)
    .then(_ => {
      setIsSaving(false);
      showNotificationMessage("success", "Saved the log and updated inventory successfully.");
      setIsEditable(false);
    })
    .catch(error => {
      showNotificationMessage("error", error.message? error.message : "Error saving data.")
    });
  }

  const clearLog = () => {
    setIsSaving(true);
    setDelOpen(false);

    dbSalesInstance
    .doc(currentDoc)
    .delete()
    .then(() => {
      setIsSaving(false);
      showNotificationMessage("success", "Deleted the log successfully.");
      setIsEditable(true);
      setSaleItems([]);
    }).catch(error => {
      showNotificationMessage("error", error.message ? error.message : "Error deleting data.")
    });
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <fieldset  className={clsx(classes.searchBar, "MuiPaper-elevation1",  "MuiPaper-rounded", "paper-looking-fieldset")}>
            <legend className="paper-looking-fieldset-legend">Log/View Sales</legend>
            <Grid className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={2}>
                <DatePicker className={classes.shortInput} currentDate={currentDate} 
                disabled={
                  Object.keys(productsObject).length === 0 || 
                  Object.keys(branchesObject).length === 0 ||
                  isSaving === true
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
                      Object.keys(productsObject).length === 0 || 
                      Object.keys(branchesObject).length === 0 ||
                      isSaving === true
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
                  disabled={
                    Object.keys(productsObject).length === 0 || 
                    Object.keys(branchesObject).length === 0 ||
                    isSaving === true
                  }
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
                disabled={
                  Object.keys(productsObject).length === 0 || 
                  Object.keys(branchesObject).length === 0 ||
                  isSaving === true
                }
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
                    disabled={
                      Object.keys(productsObject).length === 0 || 
                      Object.keys(branchesObject).length === 0 ||
                      isSaving === true
                    }
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
                disabled={(currentDate === "" || currentBranch === "" || currentItem === null || currentNumberOfItem === 0 || isSaving)? true: false}
                onClick={addItemToList}
                >
                  Add
                </Button>
              </Grid>
            </Grid> 
          </fieldset>     
        </Grid>   
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <Orders saleItems={saleItems} setSaleItems={setSaleItems} isLoading={isLoading} isEditable={isEditable} removeItemFromLog={removeItemFromLog}/>
            <div className={classes.fixedHeightToolBar}>
              {
                !isEditable && 
                <Button 
                  className={classes.deleteBtn} 
                  variant="contained" 
                  color="secondary"
                  style={{width: '200px'}}
                  disabled={saleItems.length === 0 || isSaving}
                  onClick={() =>setDelOpen(true)}
                  >
                  {isSaving? "Updating...": "Delete"}
                </Button>
              }
              {
                isEditable && 
                <Button  
                  variant="contained" 
                  color="primary"
                  style={{width: '200px'}}
                  disabled={saleItems.length === 0 || !isEditable || isSaving}
                  onClick={() => setOpen(true)}
                  >
                  {isSaving? "Saving...": "Save"}
                </Button>
              }      
              
            </div>
          </Paper>
        </Grid>        
      </Grid>
      <ConfirmationDialog
        id="log-sales-confirmation"
        keepMounted
        label="save the log? you will not be able to edit after saving"
        open={open}
        onConfirm={saveLog}
        onClose={() => setOpen(false)}
        value={"dummy val"}
      />
      <ConfirmationDialog
        id="delete-sales-confirmation"
        keepMounted
        label="delete the log? you will have to re enter the record"
        open={delOpen}
        onConfirm={clearLog}
        onClose={() => setDelOpen(false)}
        value={"dummy val"}
      />
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>  
    </>
  );
}