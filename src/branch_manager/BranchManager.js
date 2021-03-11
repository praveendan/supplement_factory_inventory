import React,{useState} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Title from './../shared/Title'
import BranchListTable from './BranchListTable';

// Generate Order Data
function createData(id, name) {
  return { id, name };
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

  const [value, setValue] = React.useState('');
  const [branches, setBranches] = useState([
    createData(0, 'Kandy'),
    createData(1, 'Kurunagala'),
    createData(2, 'galaha'),
    createData(3, 'Katugastota'),
  ]);

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const addBranch = () => {
    var tempArray = branches.slice();
    tempArray.unshift(createData(Math.random(), value))
    setBranches(tempArray)
  } 

  return (
    <>
      <Title>Branch Manager</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <TextField className={classes.shortInput} id="branch-name" onChange={(e) => setValue(e.target.value)} label="Branch name" variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={2} lg={1}>
                <Button className={classes.shortInput} onClick={addBranch} disabled={!value || value == ""? true: false} variant="contained" color="primary">
                  Add
                </Button>
              </Grid>
            </Grid> 
          </Paper>
        </Grid>   
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <BranchListTable rowData={branches} setBranches={setBranches}/>
          </Paper>
        </Grid>        
      </Grid>
    </>
  );
}
