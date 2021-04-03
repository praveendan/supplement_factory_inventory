import React,{useState, useEffect,useContext} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { dbInstance } from './../firebaseConfig';

import Title from '../shared/Title'
import CategoryListTable from './CategoryListTable';
import Snackbar from './../shared/Notification'

import { ReferenceDataContext } from "./../ReferenceDataContext";

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

export default function CategoryManager() {
  const classes = useStyles();
  const dbCollectionInstance = dbInstance.collection("categories");

  const [value, setValue] = React.useState('');
  const [categories, setCategories] = useState([]);
  const { categoriesObject } = useContext(ReferenceDataContext);
  const [isLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  useEffect(() => {
    var categoryList = [];
    Object.keys(categoriesObject).forEach(d => categoryList.push(createData(d, categoriesObject[d].name)));
    setCategories(categoryList);
  },[categoriesObject])


  const addCategory = () => {
    let result = categories.filter(category => category.name.toLowerCase().trim() === value.toLowerCase().trim());
    if(result.length === 0) {
      dbCollectionInstance.add({
        name: value,
      })
      .then((_docRef) => { })
      .catch((_error) => {
        setNotification("Error adding category.");
        setNotificationBarOpen(true);
        setNotificationSeverity("error");
      });
    } else {
      setNotification("A category with the same name exists.");
      setNotificationBarOpen(true);
      setNotificationSeverity("warning");
    }
  }

  const deleteFunction = (category)  => {
    dbCollectionInstance.doc(category.id).delete().then(() => {
      setNotification(`The category ${category.name} has been deleted successfully.`);
      setNotificationBarOpen(true);
      setNotificationSeverity("success");
    }).catch((error) => {
      setNotification(`Error deleting category ${category.name}`);
      setNotificationBarOpen(true);
      setNotificationSeverity("error");
    });
  }

  return (
    <>
      <Title>Category Manager</Title>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.searchBar}>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <TextField className={classes.shortInput} id="category-name" onChange={(e) => setValue(e.target.value)} label="Category name" variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Button className={classes.shortInput} onClick={addCategory} disabled={!value || value === ""? true: false} variant="contained" color="primary">
                  Add
                </Button>
              </Grid>
            </Grid> 
          </Paper>
        </Grid>   
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <CategoryListTable rowData={categories} setCategories={setCategories} isLoading={isLoading} deleteFunction={deleteFunction}/>
          </Paper>
        </Grid>        
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>
    </>
  );
}
