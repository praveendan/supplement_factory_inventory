// *https://www.registers.service.gov.uk/registers/country/use-the-api*
//import fetch from "cross-fetch";
import React, {useState, useEffect} from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

const products = {
  prod1: {
    name: "whey gold standard"
  },
  prod2: {
    name: "Nitrotech"
  }
};

export default function ProductsDropdown({setCurrentItem, ...props}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      // const response = await fetch(
      //   "https://country.register.gov.uk/records.json?page-size=5000"
      // );
      await sleep(1e3); // For demo purposes.
      //const countries = await response.json();

      if (active) {
        //setOptions(Object.keys(countries).map((key) => countries[key].item[0]));
        setOptions(
          Object.keys(products).map((key) => {
            return {
              itemCode: key,
              itemName: products[key].name
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
