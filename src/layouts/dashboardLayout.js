
import React from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import {BrowserRouter as Router, Switch, Route} from  'react-router-dom';

import Nav from './../shared/Nav';
//import Dashboard from './../dashboard/Dashboard';
import LogSales from './../log_sales/LogSales';
import SaleHistory from './../log_sales_history/SaleHistory';
import BranchManager from './../branch_manager/BranchManager';
import CategoryManager from './../category_manager/CategoryManager';
import ProductManager from './../product_manager/ProductManager';
import StockManager from './../stock_manager/StockManager';
import NoMatch from './../404';
import Copyright from './../shared/Copyright'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));

export default function DashaboardLayout() {
  const classes = useStyles();

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <Nav/>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <Switch>
              {/* <Route path="/dashboard"  exact component={Dashboard} /> */}
              <Route path="/dashboard/sales/log-sale"  exact component={LogSales} />
              <Route path="/dashboard/sales/sale-history" exact component={SaleHistory}/>
              <Route path="/dashboard/manage-branches"  exact component={BranchManager} />
              <Route path="/dashboard/manage-products" exact component={ProductManager}/>
              <Route path="/dashboard/manage-categories" exact component={CategoryManager}/>
              <Route path="/dashboard/manage-stock" exact component={StockManager}/>
              <Route path="*" component={ NoMatch } />
            </Switch>
            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        </main>
      </div>
    </Router>
      
  );
}

