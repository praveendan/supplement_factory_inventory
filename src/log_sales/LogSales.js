import React, {useState} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import DatePicker from './Datepicker'
import Title from './../shared/Title'
import Orders from './OrdersTable';
import ProductsDropDown from './../shared/ProductsDropdown'

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

  const addItemToList = () => {
    var tempArray = saleItems.slice();
    tempArray.push({
      id: Math.random(),
      saleDate: currentDate,
      saleBranch: currentBranch,
      saleItem: currentItem.itemName,
      saleNumberOfItems: currentNumberOfItem,
      saleIsReturn: currentReturnState,
      currentItemCode: currentItem.itemCode
    })

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
                    value={currentBranch}
                    onChange={(e) => setCurrentBranch(e.target.value)}
                  >
                    <option aria-label="None" value="" />
                    <option value={10}>Ten</option>
                    <option value={20}>Twenty</option>
                    <option value={30}>Thirty</option>
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
          </Paper>
        </Grid>        
      </Grid>
    </>
  );
}
