import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import StorefrontIcon from '@material-ui/icons/Storefront';
import CategoryIcon from '@material-ui/icons/Category';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import BallotIcon from '@material-ui/icons/Ballot';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import AssignmentIcon from '@material-ui/icons/Assignment';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import HistoryIcon from '@material-ui/icons/History';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CreateIcon from '@material-ui/icons/Create';
import { Link } from 'react-router-dom';

export const MainListItems = () => {
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
        <ListItem button onClick={handleLogClick}>
          <ListItemIcon>
            <MonetizationOnIcon />
          </ListItemIcon>
          <ListItemText primary="Sales" />
          {openProductLogMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openProductLogMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/dashboard/sales/log-sale">
              <ListItem button>
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText primary="Log sales" />
              </ListItem>
            </Link>
            <Link to="/dashboard/sales/sale-history">
              <ListItem button>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText primary="View history" />
              </ListItem>
            </Link>
          </List>
        </Collapse>
        <Link to="/dashboard/manage-stock">
          <ListItem button>
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText primary="Manage stock" />
          </ListItem>
        </Link>
        <Link to="/dashboard/manage-branches">
          <ListItem button>
            <ListItemIcon>
              <StorefrontIcon />
            </ListItemIcon>
            <ListItemText primary="Branches" />
          </ListItem>
        </Link>
        <ListItem button onClick={handleProductClick}>
          <ListItemIcon>
            <BallotIcon />
          </ListItemIcon>
          <ListItemText primary="Item management" />
          {openProductMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openProductMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/dashboard/manage-products">
              <ListItem button>
                <ListItemIcon>
                  <FitnessCenterIcon />
                </ListItemIcon>
                <ListItemText primary="Products" />
              </ListItem>
            </Link>
            <Link to="/dashboard/manage-categories">
              <ListItem button>
                <ListItemIcon>
                  <CategoryIcon />
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
