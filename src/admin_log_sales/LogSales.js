import React, {useState, useEffect, useContext} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import ConfirmationDialog from './../shared/ConfirmationDialog'
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import firebase from './../firebaseConfig';
import { dbInstance } from './../firebaseConfig';

import DatePicker from '../shared/Datepicker'
import Orders from './OrdersTable';

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
  },
  duplicatedRecordsHolder: {
    display: 'flex',
  }
}));

export default function LogSales() {
  const classes = useStyles();

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [currentDate, setcurrentDate] = useState("");
  const [currentBranch, setCurrentBranch] = useState("");
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
  const [records, setRecords] = useState([]);

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
      const tempRecords = [];

      dbSalesInstance
      .where("branch", "==", currentBranch)
      .where("readable_date", "==", currentDate)
      .get()
      .then((querySnapshot) => {
        console.log('querySnapshot');
        var tempArray = [];
        querySnapshot.forEach((doc) => {
          tempRecords.push({
            id: doc.id,
            data: doc.data()
          })
          setCurrentDoc(doc.id);
          let dataObject = doc.data();
          console.log(doc.id)

          Object.keys(dataObject).forEach(d => {
            if(d !== 'date' &&
              d !== 'branch' &&
              d !== 'readable_date' &&
              productsObject[d]
              ){
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
        setRecords(tempRecords);
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

  const deleteRecord = (id) => {
    console.log(id);
    setIsSaving(true);
    setDelOpen(false);

    dbSalesInstance
    .doc(id)
    .delete()
    .then(() => {
      setIsSaving(false);
      showNotificationMessage("success", "Deleted the log successfully.");
      setIsEditable(true);
      setSaleItems([]);
    }).catch(error => {
      showNotificationMessage("error", error.message ? error.message : "Error deleting data.");
      setIsSaving(false);
    });
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <fieldset  className={clsx(classes.searchBar, "MuiPaper-elevation1",  "MuiPaper-rounded", "paper-looking-fieldset")}>
            <legend className="paper-looking-fieldset-legend">Sales Inspector</legend>
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
            </Grid> 
          </fieldset>     
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <p>Total records : {records.length}</p>
            {records.map(item => <div className={classes.duplicatedRecordsHolder} key={item.id}>
              <p>record Id : {item.id}</p>
              <IconButton aria-label="delete" onClick={_ => {deleteRecord(item.id)}}>
          <DeleteIcon />
        </IconButton>
            </div>)}
          </Paper>
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