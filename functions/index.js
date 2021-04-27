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

// Saves the sale log
exports.updateSaleLog = functions.https.onCall((data, context) => {
  if (!context.auth) return {status: 'error', code: 401, message: 'Not signed in'}
  let branch = data.branch;
  let date = data.date;

  myDate = date.split("-");
  var newDate = new Date( myDate[0], myDate[1] - 1, myDate[2]);

  let logSnapshot = {} 
  logSnapshot[branch] = data.recordItems;
  logSnapshot.date = newDate.getTime();

  return admin.firestore().collection("sales").doc(date).set(logSnapshot, { merge: true })
  .then(() => {
    console.log(`Log ${date}-${branch} successfully written!`);
    return admin.firestore().collection("inventory").doc(branch).get()
    .then((doc) => {
      if (doc.exists) {
        let documentData = doc.data();
        Object.keys(data.recordItems).forEach((itemKey) => {
          if(documentData[itemKey]){
            documentData[itemKey] -= data.recordItems[itemKey];
          } else {
            documentData[itemKey] = -data.recordItems[itemKey];
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

// deletes the sale log
exports.deleteSaleLog = functions.https.onCall((data, context) => {
  if (!context.auth) return {status: 'error', code: 401, message: 'Not signed in'}
  let branch = data.branch;
  let date = data.date;

  return admin.firestore().collection("sales").doc(date).get()
  .then((doc) => {
    if(doc.exists){
      let documentData = doc.data();
      delete documentData[branch]
      const dbUpdate = doc.data()[branch];

      return admin.firestore().collection("inventory").doc(branch).get()
      .then((branchDoc) => {
        if (branchDoc.exists) {
          let branchDocumentData = branchDoc.data();
          Object.keys(dbUpdate).forEach((itemKey) => {
            if(branchDocumentData[itemKey]){
              branchDocumentData[itemKey] += dbUpdate[itemKey];
            } else {
              branchDocumentData[itemKey] = dbUpdate[itemKey];
            }
          });
  
          return admin.firestore().collection("inventory").doc(branch).update(branchDocumentData)
            .then(() => {
              console.log(`Inventory update of deletion ${branch} successful`);

              return admin.firestore().collection("sales").doc(date).set(documentData)
              .then(()=> {
                return { status: "SUCCESS" };
              })
              .catch((e) => {
                return { 
                  status: "FAILURE",
                  message: "Error in deleting the sale record"
                };
              })              
            })
            .catch((error) => {
              console.log(`Inventory update of deletion ${branch} unsuccessful`, error);
              return { 
                status: "FAILURE",
                message: "Error in updating the inventory"
              };
            });
        } else {
          // doc.data() will be undefined in this case
          console.log(`No such branch ${branch} to update deletion`);
          return { 
            status: "FAILURE",
            message: "No such branch in the inventory to update deletion"
          };
        }
      }).catch((error) => {
          console.log("Error getting document in update deletion:", error);
          return { 
            status: "FAILURE",
            message: "Error retrieving the branch to update the inventory deletion"
          };
      });
    } else {
      return { 
        status: "FAILURE",
        message: "Error retrieving the log to update"
      };
    }
  })
  .catch((error) => {
    return { 
      status: "FAILURE",
      message: "Critical error in retrieving the log to update"
    };
  })
});

exports.updateInventory = functions.https.onCall(async (data, context) => {
  if (!context.auth) return {status: 'error', code: 401, message: 'Not signed in'}
  let branch = data.branch;
  let stocksUpdateObject = data.stocksUpdateObject;
  let inventoryUpdateSnapshot = data.inventoryUpdateSnapshot;
  const promises = [];

  const inventoryUpdateSnapshotCollection = admin.firestore().collection("inventory_update_snapshots");
  const inventoryCollection = admin.firestore().collection("inventory");

  promises.push(inventoryUpdateSnapshotCollection
  .where("date", "==", inventoryUpdateSnapshot.date)
  .where("branch", "==", branch)
  .limit(1)
  .get()
  .then((querySnapshot) => {
    if (!querySnapshot.empty) {
      const snapShotId = querySnapshot.docs[0].id;
      return inventoryUpdateSnapshotCollection.doc(snapShotId).set(inventoryUpdateSnapshot)
      .then(() => {
        console.log(`${branch}-${inventoryUpdateSnapshot.date} written`);
        return { 
          status: "SUCCESS",
          message: "Inventory log updated successfully" 
        };
      })
      .catch((error) => {
        console.error(`${branch}-${inventoryUpdateSnapshot.date} not written`, error);
        return { 
          status: "FAILURE",
          message: "Error updating log"
        };
      });
    } else {
      return inventoryUpdateSnapshotCollection.add(inventoryUpdateSnapshot)
      .then(() => {
        console.log(`${branch}-${inventoryUpdateSnapshot.date} added`);
        return { 
          status: "SUCCESS",
          message: "Inventory log added successfully" 
        };
      })
      .catch((error) => {
        console.error(`${branch}-${inventoryUpdateSnapshot.date} not added`, error);
        return { 
          status: "FAILURE",
          message: "Error adding log"
        };
      });
    }
  })
  .catch((error) => {
    console.log("Error getting documents: ", error);
    return { 
      status: "FAILURE",
      message: "Error getting log"
    };
  }));

  promises.push(inventoryCollection.doc(branch).set(stocksUpdateObject)
  .then(() => {
    console.log(`${branch}-${inventoryUpdateSnapshot.date} branch update written`);
    return { 
      status: "SUCCESS",
      message: "Inventory updated successfully" 
    };
  })
  .catch((error) => {
    console.error(`${branch}-${inventoryUpdateSnapshot.date} branch update not written`, error);
    return { 
      status: "FAILURE",
      message: "Error writing inventory"
    };
  }));

  const [inventoryUpdateLogStatus, inventoryUpdateStatus] = await Promise.all(promises);
  return {
    status: "SUCCESS",
    messages: [inventoryUpdateLogStatus.message, inventoryUpdateStatus.message]
  }
});

