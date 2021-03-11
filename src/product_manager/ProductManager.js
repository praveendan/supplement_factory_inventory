import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import Title from '../shared/Title'
import ProductListTable from './ProductListTable';

// Generate Order Data
function createData(id, category, name) {
  return { id, category, name };
}

const catMap = {
  whey_protein: {
    name : 'Whey protein'
  },
  creatine: {
    name : 'Creatine'
  },
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

  const [currentProductName, setCurrentProductName] = React.useState('');
  const [currentProductCat, setCurrentProductCat] = React.useState('');
  const [products, setProducts] = useState([
    createData(0, 'whey_protein', 'gold standard'),
    createData(1, 'whey_protein', 'platrinum'),
    createData(2, 'creatine', 'creatine mono'),
  ]);

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const addProduct = () => {
    var tempArray = products.slice();
    var duplicateCheck = products.find(element => element.category == currentProductCat && element.name == currentProductName);
    if(!duplicateCheck){
      tempArray.unshift(createData(Math.random(), currentProductCat, currentProductName))
      setProducts(tempArray)
    }
    
  }

  return (
    <>
      <Title>Product Manager</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={5} lg={5}>
                <TextField className={classes.shortInput} id="product-name" onChange={(e) => setCurrentProductName(e.target.value)} label="Product name" variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={4} lg={5}>
              <FormControl className={classes.shortInput} variant="outlined" size="small">
                <InputLabel htmlFor="category-selector">Category</InputLabel>
                  <Select
                    native
                    label="Category"
                    inputProps={{
                      name: 'category',
                      id: 'category-selector',
                    }}
                    value={currentProductCat}
                    onChange={(e) => setCurrentProductCat(e.target.value)}
                  >
                    <option aria-label="None" value="" />
                    { Object.keys(catMap).map((d, key) => (<option key={d} value={d}>{catMap[d].name}</option>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} lg={2}>
                <Button className={classes.shortInput} onClick={addProduct} disabled={!currentProductCat || currentProductCat == "" || !currentProductName || currentProductName == ""? true : false} variant="contained" color="primary">
                  Add
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <ProductListTable rowData={products} setProducts={setProducts} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
