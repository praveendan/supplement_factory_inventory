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