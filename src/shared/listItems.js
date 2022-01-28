import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import StorefrontIcon from '@material-ui/icons/Storefront';
import CategoryIcon from '@material-ui/icons/Category';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import BallotIcon from '@material-ui/icons/Ballot';
import AssignmentIcon from '@material-ui/icons/Assignment';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import HistoryIcon from '@material-ui/icons/History';
import SyncIcon from '@material-ui/icons/Sync';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CreateIcon from '@material-ui/icons/Create';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
//import {theme} from './../theme/theme'

const useStyles = makeStyles((theme) => ({
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main
  },
  linkExpandable: {
    color: theme.palette.primary.light
  },
  linkIcon: {
    color: theme.palette.primary.main
  }
}));

export const MainListItems = () => {
  const classes = useStyles();
  const [openProductLogMenu, setOpenProductLogMenu] = React.useState(false);
  const [openProductMenu, setOpenProductMenu] = React.useState(false);

  const handleLogClick = () => {
    setOpenProductLogMenu(!openProductLogMenu);
  }
  const handleProductClick = () => {
    setOpenProductMenu(!openProductMenu);
  };

  return (
    <List>
      <div>
        {/* <Link to="/">
          <ListItem button>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </Link> */}
        <ListItem button className={classes.linkExpandable} onClick={handleLogClick}>
          <ListItemIcon>
            <MonetizationOnIcon className={classes.linkIcon}/>
          </ListItemIcon>
          <ListItemText primary="Sales" />
          {openProductLogMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openProductLogMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link className={classes.link} to="/dashboard/sales/log-sale">
              <ListItem button>
                <ListItemIcon>
                  <ShoppingCartIcon className={classes.linkIcon}/>
                </ListItemIcon>
                <ListItemText primary="Sales" />
              </ListItem>
            </Link>
            <Link className={classes.link} to="/dashboard/sales/sale-history">
              <ListItem button>
                <ListItemIcon>
                  <HistoryIcon className={classes.linkIcon}/>
                </ListItemIcon>
                <ListItemText primary="View history" />
              </ListItem>
            </Link>
          </List>
        </Collapse>
        <Link className={classes.link} to="/dashboard/manage-stock">
          <ListItem button>
            <ListItemIcon>
              <CreateIcon className={classes.linkIcon}/>
            </ListItemIcon>
            <ListItemText primary="Manage stock" />
          </ListItem>
        </Link>
        <Link className={classes.link} to="/dashboard/sync-stock">
          <ListItem button>
            <ListItemIcon>
              <SyncIcon className={classes.linkIcon}/>
            </ListItemIcon>
            <ListItemText primary="Sync Stock" />
          </ListItem>
        </Link>
        <Link className={classes.link} to="/dashboard/manage-branches">
          <ListItem button>
            <ListItemIcon>
              <StorefrontIcon className={classes.linkIcon}/>
            </ListItemIcon>
            <ListItemText primary="Branches" />
          </ListItem>
        </Link>
        <ListItem button className={classes.linkExpandable} onClick={handleProductClick}>
          <ListItemIcon>
            <BallotIcon className={classes.linkIcon}/>
          </ListItemIcon>
          <ListItemText primary="Item management" />
          {openProductMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openProductMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link className={classes.link} to="/dashboard/manage-products">
              <ListItem button>
                <ListItemIcon>
                  <FitnessCenterIcon className={classes.linkIcon}/>
                </ListItemIcon>
                <ListItemText primary="Products" />
              </ListItem>
            </Link>
            <Link className={classes.link} to="/dashboard/manage-categories">
              <ListItem button>
                <ListItemIcon>
                  <CategoryIcon className={classes.linkIcon}/>
                </ListItemIcon>
                <ListItemText primary="Categories" />
              </ListItem>
            </Link>
          </List>
        </Collapse>
      </div>
    </List>
  );
}

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Saved reports</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItem>
  </div>
);
