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
import StockListTable from './StockListTable';

// Generate Order Data
function createData(id, name, numberOfItems) {
  return { id, name, numberOfItems, tempNumberUpdate: 0, isUpdated: false };
}

const branch = {
  ky: {
    name: "Kandy"
  },
  pera: {
    name: "Peradeniya"
  }
}

const catMap = {
  whey_protein: {
    name: 'Whey protein'
  },
  creatine: {
    name: 'Creatine'
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

  const [currentStockBranch, setCurrentStockBranch] = React.useState('');
  const [currentStockCat, setCurrentStockCat] = React.useState('');
  const [stocks, setStocks] = useState([
    createData(0, 'gold standard', 5),
    createData(1, 'platrinum', 10),
    createData(2, 'creatine mono', 2),
  ]);

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

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
                    value={currentStockBranch}
                    onChange={(e) => setCurrentStockBranch(e.target.value)}
                  >
                    <option aria-label="None" value="" />
                    {Object.keys(branch).map((d, key) => (<option key={d} value={d}>{branch[d].name}</option>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <FormControl className={classes.shortInput} variant="outlined" size="small">
                  <InputLabel htmlFor="category-selector">Category</InputLabel>
                  <Select
                    native
                    label="Category"
                    inputProps={{
                      name: 'category',
                      id: 'category-selector',
                    }}
                    value={currentStockCat}
                    onChange={(e) => setCurrentStockCat(e.target.value)}
                  >
                    <option aria-label="None" value="" />
                    {Object.keys(catMap).map((d, key) => (<option key={d} value={d}>{catMap[d].name}</option>))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <StockListTable rowData={stocks} setStocks={setStocks} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
