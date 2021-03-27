import { createContext, useState, useEffect } from "react";
import { dbInstance } from './firebaseConfig';
const ReferenceDataContext = createContext();

const ReferenceDataContextProvider = ({ children }) => {
  const [branchesObject, setBranchesObject] = useState({});
  const [categoriesObject, setCategoriesObject] = useState({});

  useEffect(() => {
    const dbBranchInstance = dbInstance.collection("branches");
    dbBranchInstance.onSnapshot((snapshot) => {
      var branchesList = {};
      snapshot.forEach((doc) => {
        branchesList[doc.id] = {
          name: doc.data().name
        }
      });
      setBranchesObject(branchesList);
    }, (error) => {
      console.error("Error retirving info: ", error);
    });

    const dbCategoryInstance = dbInstance.collection("categories");
    dbCategoryInstance.onSnapshot((snapshot) => {
      var categoryList = {};
      snapshot.forEach((doc) => {
        categoryList[doc.id] = {
          name: doc.data().name
        }
      });
      setCategoriesObject(categoryList);
    }, (error) => {
      console.error("Error retirving info: ", error);
    })

  },[]);

  return (
    <ReferenceDataContext.Provider value={{ branchesObject, categoriesObject }}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

export { ReferenceDataContext, ReferenceDataContextProvider };