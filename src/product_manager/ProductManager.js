import React, { useState, useEffect, useContext } from 'react';
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

import ProductListTable from './ProductListTable';
import Snackbar from './../shared/Notification';

import { ReferenceDataContext } from "./../ReferenceDataContext";

// Generate Order Data
function createData(id, category, name) {
  return { id, category, name };
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
    minHeight: theme.classes.fixedHeightPaperMinHeight,
    height: theme.classes.fixedHeightPaper,
  },
  searchBar: {
    padding: theme.spacing(2),
  }
}));

export default function LogSales() {
  const classes = useStyles();
  const dbCollectionInstance = dbInstance.collection("products");
  const { categoriesObject } = useContext(ReferenceDataContext);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProductName, setCurrentProductName] = useState('');
  const [currentProductCat, setCurrentProductCat] = useState('');
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  const [isEditingDisabled, setIsEditingDisabled] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  useEffect(() => {
    const unsubscribe = dbCollectionInstance.onSnapshot((snapshot) => {
      var productList = [];
      snapshot.forEach((doc) => {
        productList.push(createData(doc.id, doc.data().category, doc.data().name))
      });
      setProducts(productList);
      setIsLoading(false)
    }, (error) => {
      setNotification("Error retrieving data.");
      setNotificationBarOpen(true);
      setNotificationSeverity("error");
      console.error("Error retirving info: ", error);
      setIsLoading(false)
    });

    return () => { unsubscribe(); };
  },[])

  const addProduct = () => {
    let result = products.filter(product => product.name.toLowerCase().trim() === currentProductName.toLowerCase().trim());
    if(result.length === 0) {
      dbCollectionInstance.add({
        name: currentProductName,
        category: currentProductCat
      })
      .then((_docRef) => { })
      .catch((_error) => {
        setNotification("Error adding product.");
        setNotificationBarOpen(true);
        setNotificationSeverity("error");
      });
    } else {
      setNotification("A product with the same name exists.");
      setNotificationBarOpen(true);
      setNotificationSeverity("warning");
    }
  }

  const deleteFunction = (product)  => {
    dbCollectionInstance.doc(product.id).delete().then(() => {
      setNotification(`The product ${product.name} has been deleted successfully.`);
      setNotificationBarOpen(true);
      setNotificationSeverity("success");
    }).catch((error) => {
      setNotification(`Error deleting product ${product.name}`);
      setNotificationBarOpen(true);
      setNotificationSeverity("error");
    });
  }

  const updateName = (productId, newName) => {
    console.log(productId);
    console.log(newName);
    console.log("saving");
    setIsEditingDisabled(true);
    dbCollectionInstance
      .doc(productId)
      .update({
        name: newName
      })
      .then(_ => {
        setIsEditingDisabled(false);
        setNotification(`The product has been renamed successfully.`);
        setNotificationBarOpen(true);
        setNotificationSeverity("success");

      })
      .catch((error) => {
        setIsEditingDisabled(false);
        setNotification(`Error renaming product`);
        setNotificationBarOpen(true);
        setNotificationSeverity("error");
      });
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <fieldset  className={clsx(classes.searchBar, "MuiPaper-elevation1",  "MuiPaper-rounded", "paper-looking-fieldset")}>
            <legend className="paper-looking-fieldset-legend">Product Manager</legend>
            <Grid justify="flex-end" className={classes.formRoot} container spacing={3}>
              <Grid item xs={12} sm={5} lg={3}>
                <TextField className={classes.shortInput} id="product-name" onChange={(e) => setCurrentProductName(e.target.value)} label="Product name" variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={4} lg={2}>
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
                    { Object.keys(categoriesObject).map((d, key) => (<option key={d} value={d}>{categoriesObject[d].name}</option>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} lg={1}>
                <Button className={classes.shortInput} onClick={addProduct} disabled={!currentProductCat || currentProductCat === "" || !currentProductName || currentProductName === ""? true : false} variant="contained" color="primary">
                  Add
                </Button>
              </Grid>
            </Grid>
          </fieldset>
        </Grid>
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <ProductListTable 
              rowData={products} 
              isLoading={isLoading} 
              categoriesList={categoriesObject} 
              deleteFunction={deleteFunction} 
              updateName={updateName}
              isEditingDisabled={isEditingDisabled}/>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>
    </>
  );
}
