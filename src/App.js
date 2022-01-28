
import React, { useEffect, useState } from 'react';
import './App.css';
import { auth, dbInstance } from './firebaseConfig'
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {theme} from './theme/theme';

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
  const [userLevel, setUserLevel] = useState(null);
   // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        dbInstance.collection("users")
        .where("uid", "==", user.uid)
        .limit(1)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const role = querySnapshot.docs[0].data().role;
            setUserLevel(role);
          }
        });
      }
      setIsLoading(false);
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  },[])

  return (
    !isLoading? 
    <ThemeProvider theme={theme}>
      <Router>
        <div>
        <Switch>
          <Route path="/login" exact>
            <SignIn setUser={setUser}/>
          </Route>
          <PrivateRoute path='/dashboard' user={user}>
            <ReferenceDataContextProvider>
              <DashboardLayout userLevel={userLevel}/>
            </ReferenceDataContextProvider>
          </PrivateRoute>
          <PrivateRoute path='/' user={user}>
            <Redirect to='/dashboard/sales/log-sale' />
          </PrivateRoute>
          </Switch>
        </div>
      </Router>
      </ThemeProvider>
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