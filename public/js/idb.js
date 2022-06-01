// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result; 
    
    db.createObjectStore('offline_budget', { autoIncrement: true }); 
};

// When we connect to indexedDB
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
    db = event.target.result;
    // check if app is online, if yes run checkDatabase() function to send all local db data to api
    if (navigator.onLine) {
        addBudget();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new budget and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['offline_budget'], 'readwrite'); // open a new transaction with the database with read and write permissions 
    const budgetStore = transaction.objectStore('offline_budget'); 
    budgetStore.add(record); 
}

function addBudget() { 
    const transaction = db.transaction(['offline_budget'], 'readwrite'); 
    const budgetStore = transaction.objectStore('offline_budget'); 
    const getAllBudget = budgetStore.getAllBudget(); 
    getAllBudget.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAllBudget.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAllBudget.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // Next two variables might not be in the scope (b/c of the callback...) Fiddle with this by commenting out. 
                    const transaction = db.transaction(['offline_budget'], 'readwrite');
                    const budgetStore = transaction.objectStore('offline_budget');
                    budgetStore.clear(); // clear all items in your store
                })
                .catch(err => {
                    console.log(err); 
                });
        }
    };
}


// listen for app coming back online
window.addEventListener('online', uploadBudget);