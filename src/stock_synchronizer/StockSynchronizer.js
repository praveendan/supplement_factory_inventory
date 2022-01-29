import React, { useState, useEffect, useContext, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { dbInstance } from '../firebaseConfig';

import StockListTable from './StockListTable';
import Snackbar from '../shared/Notification';

import { ReferenceDataContext } from "../ReferenceDataContext"

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
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: theme.classes.fixedHeightPaperToolBar,
  },
  searchBar: {
    padding: theme.spacing(2),
  },
  downloadButton: {
    marginRight: theme.spacing(1),
  }
}));

export default function StockSynchronizer() {
  const classes = useStyles();

  const dbInventoryInstance = dbInstance.collection("inventory");
  const dbInventoryUpdateInstance = dbInstance.collection("inventory_update_snapshots");
  const dbSalesInstance = dbInstance.collection("sales");

  const [currentStockBranch, setCurrentStockBranch] = useState('');

  const { branchesObject } = useContext(ReferenceDataContext);
  const { categoriesObject } = useContext(ReferenceDataContext);
  const [isLoading] = useState(false);

  const [notification, setNotification] = useState("");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);
  //error warning info success
  const [notificationSeverity, setNotificationSeverity] = useState("error");
  const [isSaving, setIsSaving] = useState(false);

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [productsList, setProductsList] = useState([]);

  const [ inventoryUpdates, setInventoryUpdates ] = useState();
  const [ sales, setSales ] = useState();
  const [ currentStock, setCurrentStock] = useState({});

  const [isMigrating, setIsMigrating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const dbProductInstance = dbInstance.collection("products");
    dbProductInstance.get()
      .then((querySnapshot) => {
        var productsListArray = [];
        querySnapshot.forEach((doc) => {

          productsListArray.push({
            id: doc.id,
            name: doc.data().name,
            category: doc.data().category
          });
        });

        setProductsList(productsListArray);
      })
      .catch((error) => {
        showNotificationMessage("error", "Error retrieving product data. Please try again later.");
        console.log("Error getting documents:", error);
      });
  }, [])

  useEffect(() => {
    setSales(null);
    setInventoryUpdates(null);
    if (currentStockBranch && currentStockBranch !== "") {

      dbInventoryUpdateInstance
        .where("branch", "==", currentStockBranch)
        .get()
        .then((querySnapshot) => {
          let updateArray = [];
          querySnapshot.forEach(doc => {
            const data = doc.data();
            updateArray.push(data);
          });
          console.log(updateArray)
          setInventoryUpdates(updateArray);
        });

      dbSalesInstance
      .where("branch", "==", currentStockBranch)
      .get()
      .then((querySnapshot) => {
        let updateArray = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          updateArray.push(data);
        });
        console.log(updateArray)
        setSales(updateArray);
      });
      

      dbInventoryInstance
      .doc(currentStockBranch)
      .get()
      .then(async (doc) => {
        if (doc.exists) {
          var data = doc.data();
          console.log(data);
          setCurrentStock(data)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStockBranch]);

  const accumulatedStocksInOutData = useMemo(() => {
    const productUpdateData = [];
    if(inventoryUpdates && sales) {
      productsList.forEach(prod => {
        var salesNumber = 0;
        var stockIn = 0;
        const productId = prod.id;
  
        inventoryUpdates.forEach(inventoryUpdate => {
          const inventoryUpdateSnapshot = inventoryUpdate['save_snapshot'];
  
          if(inventoryUpdateSnapshot[productId]) {
            stockIn += inventoryUpdateSnapshot[productId].amount;
          }
        })
  
        sales.forEach(sale => {
          if(sale[productId]) {
            salesNumber += sale[productId];
          }
        });
  
        productUpdateData.push({
          totalSales: salesNumber,
          totalStockIn: stockIn,
          id: prod.id,
          name: prod.name,
          category: categoriesObject[prod.category] && categoriesObject[prod.category].name? categoriesObject[prod.category].name: "deleted",
          calculatedStock: stockIn - salesNumber
        })
      });
    }

    console.log(productUpdateData)
    return productUpdateData;
  },[categoriesObject, inventoryUpdates, productsList, sales]);

  const synchronizeInventory = () => {
    console.log("Syncing");
    setIsSaving(true);
    var inventoryValues = {};
    accumulatedStocksInOutData.forEach(stocksVal => {
      inventoryValues[stocksVal.id] = stocksVal.calculatedStock;
    });
    console.log(inventoryValues);

    dbInventoryInstance
    .doc(currentStockBranch)
    .set(inventoryValues, { merge: true })
    .then(_ => {
      showNotificationMessage("success", "Stocks synced successfully");
    })
    .catch(e => {
      setIsSaving(false);
      showNotificationMessage("error", e.message? e.message: "Error syncing inventory data");
    })
    
    setIsSaving(false);
  }

  /*const migrateSalesToNewFormat = async() => {
    let objArray = [];
    setIsMigrating(true);
    const snapshot = await dbSalesInstance.get();

    if(snapshot) {
      snapshot.forEach(doc => {
        const data = doc.data();
        const branchList = Object.keys(data).filter(key => key !== "date");

        branchList.forEach(branch => {
          objArray.push({
            date: data.date,
            readable_date: doc.id,
            branch,
            ...data[branch]
          })
        })
      });

      console.log(objArray);
      let promisesArr = [];
      objArray.forEach(obj => {
        promisesArr.push(dbSalesInstance.add(obj))
      })

      Promise.all(promisesArr)
      .then((values) => {
        console.log(values);
        setIsMigrating(false);
        showNotificationMessage("success", "Sales updated successfully");
      })
      .catch(e => {
        showNotificationMessage("error", e.message? e.message: "Error updating sales data");
      });
    }
  }*/

  // const deleteNewSales = async() => {
  //   setDeleting(true);
  //   const snapshot = await dbSalesInstance.get();

  //   if(snapshot) {
  //     let promisesArr = [];
  //     snapshot.forEach(doc => {
  //       const data = doc.data();
  //       if(data.readable_date){
  //         promisesArr.push(dbSalesInstance.doc(doc.id).delete());
  //       }
  //     });

  //     Promise.all(promisesArr)
  //     .then((values) => {
  //       console.log(values);
  //       setIsMigrating(false);
  //       showNotificationMessage("success", "Sales deleted successfully");
  //       setDeleting(false);
  //     })
  //     .catch(e => {
  //       showNotificationMessage("error", e.message? e.message: "Error deleting sales data");
  //       setDeleting(false);
  //     });
  //   }
  // }

  const showNotificationMessage = (severety, message) => {
    setNotification(message);
    setNotificationBarOpen(true);
    setNotificationSeverity(severety);
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <fieldset className={clsx(classes.searchBar, "MuiPaper-elevation1", "MuiPaper-rounded", "paper-looking-fieldset")}>
            <legend className="paper-looking-fieldset-legend">Stock Manager</legend>
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
                    disabled={
                      productsList.length === 0 &&
                      Object.keys(branchesObject).length === 0 &&
                      Object.keys(categoriesObject).length === 0
                    }
                    value={currentStockBranch}
                    onChange={(e) => setCurrentStockBranch(e.target.value)}
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
          <Paper className={fixedHeightPaper}>
            <StockListTable isLoading={isLoading} accumulatedStocksInOutData={accumulatedStocksInOutData} currentStock={currentStock}/>
            <div className={classes.fixedHeightToolBar}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: '200px' }}
                onClick={synchronizeInventory}
                disabled={isSaving}
              >
                {isSaving ? "Syncing..." : "Sync"}
              </Button>
              {/* <Button
                variant="contained"
                color="primary"
                style={{ width: '200px' }}
                onClick={migrateSalesToNewFormat}
                disabled={isMigrating}
              >
                {isMigrating ? "Migrating..." : "Migrate"}
              </Button> */}
              {/* <Button
                variant="contained"
                color="primary"
                style={{ width: '200px' }}
                onClick={deleteNewSales}>
                {deleting? "deleting": "Delete New Sales"}
              </Button> */}
            </div>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification} />
    </>
  );
}
