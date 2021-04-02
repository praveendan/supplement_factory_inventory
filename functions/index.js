const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
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
      return Promise.all(promises)
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

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.updateInventory = functions.https.onCall((data, context) => {
  let branch = data.branch;
  let inventoryUpdateSnapshot = data.inventoryUpdateSnapshot;
  let date = data.date;
  let logSnapshot = {} 
  logSnapshot[branch] = data.logSnapshot;

  return admin.firestore().collection("sales").doc(date).set(logSnapshot, { merge: true })
  .then(() => {
    console.log(`Log ${date}-${branch} successfully written!`);
    return admin.firestore().collection("inventory").doc(branch).get()
    .then((doc) => {
      if (doc.exists) {
        let documentData = doc.data();
        Object.keys(inventoryUpdateSnapshot).forEach((itemKey) => {
          if(documentData[itemKey]){
            documentData[itemKey] += inventoryUpdateSnapshot[itemKey];
          } else {
            documentData[itemKey] = inventoryUpdateSnapshot[itemKey];
          }
        });

        return admin.firestore().collection("inventory").doc(branch).update(documentData)
          .then(() => {
            console.log(`Inventory update ${branch} successful`);
            // Returning the sanitized message to the client.
            return { status: "SUCCESS" };
          })
          .catch((error) => {
            console.log(`Inventory update ${branch} unsuccessful`, error);
            return { 
              status: "FAILURE",
              message: "Error in updating the inventory"
            };
          });
      } else {
          // doc.data() will be undefined in this case
          console.log(`No such branch ${branch} in update`);
          return { 
            status: "FAILURE",
            message: "No such branch in the inventory to update"
          };
      }
    }).catch((error) => {
        console.log("Error getting document in update:", error);
        return { 
          status: "FAILURE",
          message: "Error retrieving the branch to update the inventory"
        };
    });
  })
  .catch((error) => {
    console.error(`Error writing document ${date}-${branch}: `, error);
    return { 
      status: "FAILURE",
      message: "Error writing log"
    };
  });  
});
