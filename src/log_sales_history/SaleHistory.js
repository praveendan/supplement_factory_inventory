import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import Title from '../shared/Title'
import SaleHistoryListTable from './SaleHistoryTable';
import DatePicker from '../shared/Datepicker'

// Generate Order Data
function createData(id, name, numberOfItems) {
  return { id, name, numberOfItems };
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

export default function SaleHistory() {
  const classes = useStyles();
  const [currentDate, setcurrentDate] = useState("");
  const [currentSaleHistoryBranch, setCurrentSaleHistoryBranch] = React.useState('');

  const [saleHistory, setSaleHistory] = useState([
    createData(0, 'gold standard', 5),
    createData(1, 'platrinum', 10),
    createData(2, 'creatine mono', 2),
  ]);

  useEffect(() => {
    console.log(currentSaleHistoryBranch);
    console.log(currentDate)
  },[currentDate,currentSaleHistoryBranch]);

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <>
      <Title>Sale History</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <DatePicker className={classes.shortInput} currentDate={currentDate} setcurrentDate={setcurrentDate}/>
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
                    value={currentSaleHistoryBranch}
                    onChange={(e) => setCurrentSaleHistoryBranch(e.target.value)}
                  >
                    <option aria-label="None" value="" />
                    {Object.keys(branch).map((d, key) => (<option key={d} value={d}>{branch[d].name}</option>))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <SaleHistoryListTable rowData={saleHistory} setSaleHistorys={setSaleHistory} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
