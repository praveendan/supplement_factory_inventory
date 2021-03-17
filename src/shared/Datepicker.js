import React, {useEffect} from 'react';
import TextField from '@material-ui/core/TextField';

const today = new Date();
const dateFormatter = (dateVal) => {
  return `${dateVal.getFullYear()}-${(dateVal.getMonth()+1) < 10? "0"+(dateVal.getMonth()+1) : (dateVal.getMonth()+1)}-${dateVal.getDate() < 10? "0"+dateVal.getDate() : dateVal.getDate()}`
}

export default function Datepicker({currentDate, setcurrentDate, ...props}) {

  useEffect(() => {
    setcurrentDate(dateFormatter(today));
  },[])

  const handleDatechange = (e) => {
    var dateValue = new Date(e.target.value);
    if(dateValue <= today){
      setcurrentDate(e.target.value);
    } else {
      setcurrentDate(dateFormatter(today));
    }     
  }

  return (
    <TextField 
      id="date" label="Date"
      variant="outlined"
      type="date"
      size="small" 
      value={currentDate}
      onChange={handleDatechange}
      InputLabelProps={{ shrink: true }} {...props}/>
  )

}