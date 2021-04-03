import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import Title from './../shared/Title'

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'center'
  },
  fixedHeight: {
    minHeight: 'calc(100vh - 220px)',
  },
}));

export default function NoMatch() {
  const classes = useStyles();

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <>
      <Title>Nothing to see here.!</Title>
      <Grid container spacing={3}>  
        <Grid item xs={12}>
          <Paper className={fixedHeightPaper}>
            <Typography>Please check the URL</Typography>
          </Paper>
        </Grid>        
      </Grid>
    </>
  );
}
