import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { auth } from './../firebaseConfig'

import Snackbar from './../shared/Notification'

import {
  Redirect,
  useLocation,
} from 'react-router-dom'

import Copyright from './../shared/Copyright'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    width: '150px',
    borderRadius: 0
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function SignInComponent({authenticationFunction}) {
  const classes = useStyles();
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar src="/NEW-LOGO.png"  className={classes.avatar}>
          {/* <LockOutlinedIcon /> */}
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={userName}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={(e) => {e.preventDefault(); authenticationFunction(userName, password);}}
          >
            Sign In
          </Button>
          {/* <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid> */}
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default function SignIn({setUser}) {
  const [
    redirectToReferrer,
    setRedirectToReferrer
  ] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState("error");
  const [notificationBarOpen, setNotificationBarOpen] = useState(false);

  const { state } = useLocation()

  const showNotificationMessage = (severety, message) => {
    setNotification(message);
    setNotificationBarOpen(true);
    setNotificationSeverity(severety);
  }

  const authenticationFunction = (userName, password) => {
  //  auth.signInWithEmailAndPassword("supplementfactoryky@gmail.com", '123456')
    auth.signInWithEmailAndPassword(userName, password)
    .then((userCredential) => {
      setUser(userCredential.user);
      setRedirectToReferrer(true);
    })
    .catch((error) => {
      var errorMessage = error.message;
      showNotificationMessage("error", errorMessage)
      console.log(error)
    });
  }

  if (redirectToReferrer === true) {
    return <Redirect to={state?.from || '/dashboard/sales/log-sale'} />
  }

  return (
    <>
      <SignInComponent authenticationFunction={authenticationFunction} />
      <Snackbar isOpen={notificationBarOpen} setOpen={setNotificationBarOpen} severity={notificationSeverity} message={notification}/>  
    </>

  )
}