// *https://www.registers.service.gov.uk/registers/country/use-the-api*
//import fetch from "cross-fetch";
import React, {useState, useEffect} from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function ProductsDropdown({setCurrentItem, productsObject, ...props}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      if (active) {
        //setOptions(Object.keys(countries).map((key) => countries[key].item[0]));
        setOptions(
          Object.keys(productsObject).map((key) => {
            return {
              itemCode: key,
              itemName: productsObject[key].name
            };
          })
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const setVal = (option, value) => {
    setCurrentItem(value)
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      {...props}
      getOptionSelected={(option, value) => option.itemName === value.itemName}
      getOptionLabel={(option) => option.itemName}
      onChange={(option, value) => setVal(option, value)}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search product"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  );
}
