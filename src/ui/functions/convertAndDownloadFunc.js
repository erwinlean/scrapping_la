"use strict";

const XLSX = require('xlsx');
const btnDownload = document.getElementById('btn-download');

const xlsx_function_download = async () =>{
    let header = ["link", "titulo", "descriptcion", "cod_art", "img", "img_adicionales"];
    
    // Create a new workbook and worksheet
    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.json_to_sheet([], { header: header });

    // Add data to the worksheet
    to_convert[0].forEach(data => {        
        let row = {};
        for (let i = 0; i < header.length; i++) {
            row[header[i]] = data[i];
        }
        XLSX.utils.sheet_add_json(worksheet, [row], { skipHeader: true, origin: -1 });    
    });    
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");  
    // Convert the workbook to a buffer
    let buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    // Create a Blob object from the buffer
    let blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    // Preparing XLSX file to send into the MySQL db > by api
    // Data to send:
    const data_to_send = new FormData();
    data_to_send.append('file', blob);

    // Post to api
    const url = "not-endpoint_yet";
    const options = {
        method: "POST",
        body: data_to_send
    };
    fetch(url, options)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        console.log("Data sent successfully!");
    })
    .catch(error => {
        console.error("There was a problem sending the data:", error);
    });

    // Create a link element and set its attributes
    let link_to_xlsx_file = document.createElement("a");
    link_to_xlsx_file.href = URL.createObjectURL(blob);
    link_to_xlsx_file.download = "la_product_information.xlsx";
    // Append the link element to the DOM and trigger a click event to download the file
    document.body.appendChild(link_to_xlsx_file);
    link_to_xlsx_file.click();
    // Clean up the link element
    document.body.removeChild(link_to_xlsx_file);
};

btnDownload.onclick = xlsx_function_download;