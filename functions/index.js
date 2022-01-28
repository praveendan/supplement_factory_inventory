const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
// firebase projects:list  
// firebase use sf-inventory-1
// firebase deploy --only functions

exports.createInventoryOnCreateBranch = functions.firestore
  .document('branches/{branchId}')
  .onCreate((snap, context) => {
    return admin.firestore().collection('products')
    .get()
    .then((prodSnapshot) => {
      var inventoryObj = {};
      prodSnapshot.forEach((doc) => {
        inventoryObj[doc.id] = 0;
      });
      return admin.firestore().doc(`/inventory/${snap.id}`).set(inventoryObj)
    })
    .catch((error) => {
      console.log("Error creating inventory on branch creation: ", error);
      return 0;
    });
  });

exports.deleteInventoryOnDeleteBranch = functions.firestore
  .document('branches/{branchId}')
  .onDelete((snap, _context) => {
    return admin.firestore().collection("inventory").doc(snap.id).delete()
    .then(() => {
      return true;
    })
    .catch((error) => {
      console.error("Error deleting inventory on delete branch: ", error);
      return false;
    });
  });

exports.updateInventoryOnCreateProduct = functions.firestore
  .document('products/{productId}')
  .onCreate((snap, _context) => {
    var productKey = snap.id;
    var inventoryContent = {};
    inventoryContent[productKey] = 0;
    return admin.firestore().collection('inventory')
    .get()
    .then((inventorySnapshot) => {
      const promises = [];
      inventorySnapshot.forEach((doc) => {
        promises.push(doc.ref.update(inventoryContent));
      });
      return Promise.all(promises);
    })
    .catch((error) => {
      console.log("Error setting the inventory on create product: ", error);
      return 0;
    });
  });

exports.updateInventoryOnDeleteProduct = functions.firestore
  .document('products/{productId}')
  .onDelete((snap, _context) => {
    var productKey = snap.id;
    var inventoryContent = {};
    inventoryContent[productKey] = admin.firestore.FieldValue.delete();
    return admin.firestore().collection('inventory')
    .get()
    .then((inventorySnapshot) => {
      const promises = [];
      inventorySnapshot.forEach((doc) => {
        promises.push(doc.ref.update(inventoryContent));
      });
      return Promise.all(promises)
    })
    .catch((error) => {
      console.log("Error setting the inventory on create product: ", error);
      return 0;
    });
  });

//SF inventory V 1.1 hotfix to database update bug
/*triggering Inventory update when inventory update snapshot is saved
*/
/* optimized version */
exports.updateInventoryOnInventoryUpdateSnapshotUpdate = functions.firestore
  .document('inventory_update_snapshots/{snapId}')
  .onWrite(async (change, _context) => {
    const dbInventoryInstance = admin.firestore().collection("inventory");

    const document = change.after.exists ? change.after.data() : null;
    const prevDoc = change.before.exists ? change.before.data() : null;

    const currentStockBranch = document? document.branch : prevDoc.branch;
    const currentStockDate = document? document.date : prevDoc.date;


    const dbInventorySnap = await dbInventoryInstance
    .doc(currentStockBranch)
    .get();

    var inventoryData = dbInventorySnap.data();

    if(prevDoc) {
      Object.keys(prevDoc.save_snapshot).forEach(key => {
        inventoryData[key] = inventoryData[key]? inventoryData[key] - prevDoc.save_snapshot[key].amount : -prevDoc.save_snapshot[key].amount;
      });
    }

    if(document) {
      Object.keys(document.save_snapshot).forEach(key => {
        inventoryData[key] = inventoryData[key]? inventoryData[key] + document.save_snapshot[key].amount : document.save_snapshot[key].amount;
      });
    }

    
    dbInventoryInstance
    .doc(currentStockBranch)
    .set(inventoryData, { merge: true })
    .then(_ => {
      functions.logger.log("Updated the DB on stock update for :", {currentStockBranch , currentStockDate});
    })
    .catch(e => {
      functions.logger.error("Failed updating the DB  on stock update for :", {currentStockBranch , currentStockDate});
    })

    return null;
  });

/* original */
/*
exports.updateInventoryOnInventoryUpdateSnapshotUpdate = functions.firestore
  .document('inventory_update_snapshots/{snapId}')
  .onWrite(async (change, _context) => {

    const dbInventoryUpdateInstance = admin.firestore().collection("inventory_update_snapshots");
    const dbSalesInstance = admin.firestore().collection("sales");
    const dbProductInstance = admin.firestore().collection("products");
    const dbInventoryInstance = admin.firestore().collection("inventory");

    const document = change.after.exists ? change.after.data() : change.before.data();
    
    const currentStockBranch = document.branch;
    const currentStockDate = document.date;
    
    const dbProductsSnap = await dbProductInstance.get();

    var productsList = [];
    let inventoryUpdates = [];
    let sales = [];

    if(dbProductsSnap) {
      var productsListArray = [];
      dbProductsSnap.forEach((doc) => {

        productsListArray.push({
          id: doc.id
        });
      });

      productsList = productsListArray;
    }

    const inventorySnapshot = await dbInventoryUpdateInstance
      .where("branch", "==", currentStockBranch)
      .get();

    if(inventorySnapshot) {
      let updateArray = [];
      inventorySnapshot.forEach(doc => {
        const data = doc.data();
        updateArray.push(data);
      });
      inventoryUpdates = updateArray;
    }

    const salesSnap = await dbSalesInstance
    .where("branch", "==", currentStockBranch)
    .get()

    if(salesSnap){
      let salesArray = [];

      salesSnap.forEach(doc => {
        const data = doc.data();
        salesArray.push(data);
      });
      
      sales = salesArray;
    }

    var inventoryValues = {};

    productsList.forEach(prod => {
      var salesNumber = 0;
      var stockIn = 0;
      const productId = prod.id;
      
      inventoryUpdates.forEach(inventoryUpdate => {
        const inventoryUpdateSnapshot = inventoryUpdate['save_snapshot'];

        if(inventoryUpdateSnapshot[productId]) {
          stockIn += inventoryUpdateSnapshot[productId].amount;
        }
      })

      sales.forEach(sale => {
        if(sale[productId]) {
          salesNumber += sale[productId];
        }
      });

      inventoryValues[prod.id] = stockIn - salesNumber
    });

    dbInventoryInstance
    .doc(currentStockBranch)
    .set(inventoryValues, { merge: true })
    .then(_ => {
      functions.logger.log("Updated the DB on update snapshot for :", {currentStockBranch , currentStockDate});
    })
    .catch(e => {
      functions.logger.error("Failed updating the DB on update snapshot for :", {currentStockBranch , currentStockDate});
    })

    return null;
  });
*/

/* triggers when the sales are recorded
* will need different approach for this as db design has flaws
*/

/* optimized version */
exports.updateInventoryOnSalesUpdate = functions.firestore
  .document('sales/{saleId}')
  .onWrite(async (change, _) => {
    const dbInventoryInstance = admin.firestore().collection("inventory");

    const document = change.after.exists ? change.after.data() : null;
    const prevDoc = change.before.exists ? change.before.data() : null;

    const currentStockBranch = document? document.branch : prevDoc.branch;
    const currentStockDate = document? document.readable_date : prevDoc.readable_date;


    const dbInventorySnap = await dbInventoryInstance
    .doc(currentStockBranch)
    .get();

    var inventoryData = dbInventorySnap.data();

    const checkSalesSnapKey = (key) => {
      return (key !== "branch" && key !== "date" && key !== "readable_date");
    }

    if(prevDoc) {
      Object.keys(prevDoc).forEach(key => {
        if(checkSalesSnapKey(key)) { 
          inventoryData[key] = inventoryData[key]? inventoryData[key] + prevDoc[key] : prevDoc[key];
        }
      });
    }

    if(document) {
      Object.keys(document).forEach(key => {
        if(checkSalesSnapKey(key)) {
          inventoryData[key] = inventoryData[key]? inventoryData[key] - document[key] : -document[key];
        }
      });
    }
    
    dbInventoryInstance
    .doc(currentStockBranch)
    .set(inventoryData, { merge: true })
    .then(_ => {
      functions.logger.log("Updated the DB on sale for :", {currentStockBranch , currentStockDate});
    })
    .catch(e => {
      functions.logger.error("Failed updating the DB on sale for :", {currentStockBranch , currentStockDate});
    })

    return null;
  });

/* original version */
/*
exports.updateInventoryOnSalesUpdate = functions.firestore
  .document('sales/{saleId}')
  .onWrite(async (change, context) => {

    const dbInventoryUpdateInstance = admin.firestore().collection("inventory_update_snapshots");
    const dbSalesInstance = admin.firestore().collection("sales");
    const dbProductInstance = admin.firestore().collection("products");
    const dbInventoryInstance = admin.firestore().collection("inventory");

    const document = change.after.exists ? change.after.data() : null;
    const prevDoc = change.before.data();

    const currentStockBranch =  document? document.branch: prevDoc.branch;
    const currentStockDate = document? document.readable_date: prevDoc.readable_date;

    var productsList = [];
    let inventoryUpdates = [];
    let sales = [];
    
    const dbProductsSnap = await dbProductInstance
    .get();
    
    if(dbProductsSnap) {
      var productsListArray = [];
      dbProductsSnap.forEach((doc) => {

        productsListArray.push({
          id: doc.id
        });
      });

      productsList = productsListArray;
    }

    const inventorySnapshot = await dbInventoryUpdateInstance
      .where("branch", "==", currentStockBranch)
      .get();

    if(inventorySnapshot) {
      let updateArray = [];
      inventorySnapshot.forEach(doc => {
        const data = doc.data();
        updateArray.push(data);
      });
      inventoryUpdates = updateArray;
    }

    const salesSnap = await dbSalesInstance
      .where("branch", "==", currentStockBranch)
      .get()

    if(salesSnap){
      let salesArray = [];
      salesSnap.forEach(doc => {
        const data = doc.data();
        salesArray.push(data);
      });
      sales = salesArray;
    }

    var inventoryValues = {};

    productsList.forEach(prod => {
      var salesNumber = 0;
      var stockIn = 0;
      const productId = prod.id;
      
      inventoryUpdates.forEach(inventoryUpdate => {
        const inventoryUpdateSnapshot = inventoryUpdate['save_snapshot'];

        if(inventoryUpdateSnapshot[productId]) {
          stockIn += inventoryUpdateSnapshot[productId].amount;
        }
      })

      sales.forEach(sale => {
        if(sale[productId]) {
          salesNumber += sale[productId];
        }
      });

      inventoryValues[prod.id] = stockIn - salesNumber
    });

    dbInventoryInstance
    .doc(currentStockBranch)
    .set(inventoryValues, { merge: true })
    .then(_ => {
      functions.logger.log("Updated the DB on sale for :", {currentStockBranch , currentStockDate});
    })
    .catch(e => {
      functions.logger.error("Failed updating the DB on sale for :", {currentStockBranch , currentStockDate});
    })

    return null;
  });
  */