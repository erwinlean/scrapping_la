"use stric" 

const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const search = document.getElementById("form_submit");
const url = "https://www.laanonimaonline.com/";
let to_convert = [[]];

async function la_scrap() {
    console.clear();

    let container = document.getElementById("test");
    // Clear div container (table) if there is any element on
    if (container.hasChildNodes()) {
        container.querySelectorAll('*').forEach(n => n.remove());
    }

    //convert type of the imput
    let article_cod_input = document.getElementById("input");
    let cod_art = article_cod_input.value;
    const arr = cod_art.split(/,\s*|\s*,\s*|\s+/);

    await arr.forEach(async (element, index) => {
        // Open browser on resource and search cod_art
        console.log(`en el foreach ${element}`)
        let browser = await puppeteer.launch({args: ['--Cross-Origin-Resource-Policy'], headless: true});
        const page = await browser.newPage();
        try{
            await page.click("#ModalCodigoPostal > div.modal-wrapper.posicion_fija.ingresar-codigo-postal > span");
        }catch(e){
            void e
        }
        await page.goto(url/*, {waitUntil: "networkidle0"}*/);
        await page.waitForSelector("#buscar");
        await page.type("#buscar", element/*, {delay: 25}*/);
        await page.keyboard.press("Enter");

        // Enter on the URL of the specific prodct
        try{
            await page.click("#ModalCodigoPostal > div.modal-wrapper.posicion_fija.ingresar-codigo-postal > span");
        }catch(e){
            void e
        }
        await page.waitForSelector("#maq_cuerpo > div.maq_col_2 > div.caja1.producto > div > div");
        await page.click("#maq_cuerpo > div.maq_col_2 > div.caja1.producto > div > div");
        try{
            await page.click("#ModalCodigoPostal > div.modal-wrapper.posicion_fija.ingresar-codigo-postal > span");
        }catch(e){
            void e
        }
        await page.waitForSelector("#cont_producto > div.clearfix.valign.spa_bot > h1");

        // Get all the information needed:
        // Link/Url
        let link = page.url();
        // Product code on the page, needed to search the images
        let cod_img_4 = link.slice(-7); //HACER ESTO EN UNA FUNCION Ahorrar lineas de codigo.
        cod_img_4 = cod_img_4.substring(0, cod_img_4.length-1);
        let cod_img_1 = link.slice(-6);
        cod_img_1 = cod_img_1.substring(0, cod_img_1.length-1);
        let cod_img_2 = link.slice(-5);
        cod_img_2 = cod_img_2.substring(0, cod_img_2.length-1);
        let cod_img_3 = link.slice(-4);
        cod_img_3 = cod_img_3.substring(0, cod_img_3.length-1);
        // Images
        let imgSrc = await page.$$eval("img", allimg => allimg.map((val)=> val.getAttribute("src")));
        let regex = new RegExp(cod_img_1 + "|" + cod_img_2 + "|" + cod_img_3 + "|" + cod_img_4);
        const filteredArr = imgSrc.filter(item => regex.test(item));
        // Delete duplicates images
        for (let i = 0; i < filteredArr.length; i++) {
            const currentString = filteredArr[i];
            const lastSixChars = currentString.slice(-6);
            
            for (let j = 0; j < filteredArr.length; j++) {
                if (i !== j && filteredArr[j].includes(lastSixChars)) {
                    filteredArr.splice(i, 1);
                    i--;
                    break;
                }
            }
        };

        let title = await page.evaluate(() => document.querySelector('#cont_producto > div.clearfix.valign.spa_bot > h1').textContent);
        try{          // May have description or not, that why the "try"
                      // Deberia eliminar los divs de descripcion, los cuales tengan "-"
            var descriptcion = await page.evaluate(() => document.querySelector("#cont_producto > div.cont_images_productos.clearfix > div.texto.texto-light.color000000.font-size-16").textContent)
        }catch(e){
            void e
        };
        let article_code = await page.evaluate(() => document.querySelector("#cont_producto > div.cont_images_productos.clearfix > div.colorC4C4C4.font-size-12").textContent);
        article_code = article_code.slice(5);

        // Push items to a single array to convert XLSX  and End puppeteer
        await browser.close();
        let images_to_push=[];
        filteredArr.forEach(image => {
            images_to_push.push(image);
        });
        to_convert[0].push([link, title, descriptcion, article_code,images_to_push]);
        
        // Show on the DOM the XLSX data
        const table = document.createElement("table");
        for (let i = 0; i < to_convert[0].length; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < to_convert[0][i].length; j++) {
                const cell = document.createElement("td");
                cell.innerHTML = to_convert[0][i][j];
                row.appendChild(cell);
            };
            table.appendChild(row);
        };
        document.getElementById("test").appendChild(table);
    });
};


//testing download xlsx file >>> NOT WORKING PROPERLY
let array = [["pepe_1", "asd", "4352","3","je"],["pepe_2", "54sefasd", "224352","4","ja"],["pepe_3", "asdgg", "4324","5","jo"]];
let header = ["link", "titulo", "descriptcion", "cod_art", "img"];

function downloadExcel() {
    console.clear();
    
    let fileName = "data.xlsx";
    let sheetName = "Sheet1";
    
    let worksheet = XLSX.utils.json_to_sheet([...array], {header});
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    let wbout = XLSX.write(workbook, {bookType:'xlsx', type:'binary'});
    
    function s2ab(s) {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    let blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});

    if (typeof navigator.msSaveBlob !== 'undefined') {
        navigator.msSaveBlob(blob, fileName);
    } else {
        let downloadBtn = document.getElementById('btn-download');
        downloadBtn.href = URL.createObjectURL(blob);
        downloadBtn.download = fileName;
        downloadBtn.click();
    }
}

document.getElementById('btn-download').addEventListener('click', downloadExcel);
search.onclick = la_scrap;