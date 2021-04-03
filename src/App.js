
import React, { useEffect, useState } from 'react';
import './App.css';
import { auth } from './firebaseConfig'
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'

import DashboardLayout from './layouts/dashboardLayout'
import SignIn from './sign_in/SignIn'

import { ReferenceDataContextProvider } from "./ReferenceDataContext"

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function App() {
  const classes = useStyles();
  const [user, setUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  // auth.onAuthStateChanged(function(user) {
  //   if (user) {
  //     // User is signed in.
  //   } else {
  //     // No user is signed in.
  //   }
  // });

  // auth.onAuthStateChanged((user) => {
  //   if (user) {
  //     setUser(user)
  //   } 
  // });

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    });
    
  },[])

  return (
    !isLoading? 
      <Router>
        <div>
        <Switch>
          <Route path="/login" exact>
            <SignIn setUser={setUser}/>
          </Route>
          <PrivateRoute path='/dashboard' user={user}>
            <ReferenceDataContextProvider>
              <DashboardLayout />
            </ReferenceDataContextProvider>
          </PrivateRoute>
          <PrivateRoute path='/' user={user}>
            <Redirect to='/dashboard/sales/log-sale' />
          </PrivateRoute>
          </Switch>
        </div>
      </Router>
    : <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
  );
}

function PrivateRoute({ user, children, ...rest }) {
  return (
    <Route {...rest} render={({ location }) => {
      return user != null
        ? children
        : <Redirect to={{
          pathname: '/login',
          state: { from: location }
        }}
        />
    }} />
  )
}