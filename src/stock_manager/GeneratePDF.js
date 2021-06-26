// services/reportGenerator.js

import jsPDF from "jspdf";
import "jspdf-autotable";
// Date Fns is used to format the dates we receive
// from our API call

// define a generatePDF function that accepts a tickets argument
const generatePDF = (tickets, branch) => {
  // initialize jsPDF
  const doc = new jsPDF();

  // define the columns we want and their titles
  const tableColumn = ["Name", "Category", "Stock"];
  // define an empty array of rows
  const tableRows = [];
  
  tickets.sort((a, b) => {
    var nameA = a.categoryName.toUpperCase(); 
    var nameB = b.categoryName.toUpperCase(); 
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });

  // for each ticket pass all its data into an array
  tickets.forEach(ticket => {
    const ticketData = [
      ticket.name,
      ticket.categoryName,
      ticket.numberOfItems+ticket.tempNumberUpdate
    ];
    // push each tickcet's info into a row
    tableRows.push(ticketData);
  });


  // startY is basically margin-top
  doc.autoTable(tableColumn, tableRows, { startY: 20 });
  const date = Date().split(" ");
  // we use a date string to generate our filename.
  const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
  // ticket title. and margin-top + margin-left
  //doc.text("The stocks.", 14, 15);
  // we define the name of our PDF file.
  doc.save(`stocks_report_${branch}_${dateStr}.pdf`);
};

export default generatePDF;