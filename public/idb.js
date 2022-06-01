// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result; 
    // create an object store (table) called `new_budget`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_budget', { autoIncrement: true }); 
};

// When we connect to indexedDB
request.onsuccess = function (event) {
    // when globalDB is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
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
    const transaction = db.transaction(['new_budget'], 'readwrite'); // open a new transaction with the database with read and write permissions 
    const budgetStore = transaction.objectStore('new_budget'); // access the object store for `new_budget`
    budgetStore.add(record); // add record to your store with add method. Actual query
}
