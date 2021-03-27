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

import { dbInstance } from './../firebaseConfig';

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

  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

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
  },[]);

  const addItemToList = () => {
    var tempArray = saleItems.slice();
    const found = tempArray.findIndex(element => element.itemCode == currentItem.itemCode);
    console.log(found)
    if(-1 === found){ 
      tempArray.push({
        id: Math.random(),
        saleDate: currentDate,
        saleBranch: currentBranch,
        saleItem: currentItem.itemName,
        saleNumberOfItems: currentNumberOfItem,
        saleIsReturn: currentReturnState,
        itemCode: currentItem.itemCode
      });
    } else {
      if(currentReturnState) {
        tempArray[found].saleNumberOfItems = tempArray[found].saleNumberOfItems - currentNumberOfItem;
      } else {
        tempArray[found].saleNumberOfItems = tempArray[found].saleNumberOfItems + currentNumberOfItem;
      }           
    }
    

    setSaleItems(tempArray)
  }
  
  const setNumberOfItems = (e) => {
    if(e.target.value && e.target.value != "")
      setCurrentNumberOfItem(parseInt(e.target.value));
    else 
      setCurrentNumberOfItem(0);
  }

  return (
    <>
      <Title>Log Sales</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={2}>
                <DatePicker className={classes.shortInput} currentDate={currentDate} setcurrentDate={setcurrentDate}/>
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
                    onChange={(e) => setCurrentReturnState(e.target.value == 'true'? true: false)}
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
                disabled={(currentDate == "" || currentBranch == "" || currentItem == null || currentNumberOfItem == 0)? true: false}
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
            <Orders saleItems={saleItems} setSaleItems={setSaleItems}/>
            <div style={{display: 'grid', justifyContent:'flex-end'}}>
              <Button 
                className={classes.shortInput} 
                variant="contained" 
                color="primary"
                style={{width: '200px'}}
                disabled={saleItems.length == 0}
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
