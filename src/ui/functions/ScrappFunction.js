"use stric" 

const puppeteer = require('puppeteer');
const search = document.getElementById("form_submit");
const url =  "https://previewlaol.laanonimaws.com/"
let to_convert = [[]];
let errorHandler = document.getElementById("error-handler");
let container = document.getElementById("incoming-data_container");
// codigos de ejemplo busqueda 2974400 2974459 2974484 2974514 2806435, 2144037,2885384

// Should modularize more like > let/const in other module.

async function la_scrap() {
    console.clear();

    // test ui notes > get into variables, and re upload
    document.getElementById("loaders").style.display = "flex";

    // Clear div container (table) if there is any element on
    if (container.hasChildNodes()) { // this function shuld be modularize
        container.querySelectorAll('*').forEach(element_inside_container => element_inside_container.remove());
    };
    // Clear the array container (to_convert) for delete last searched items (if there is any)
    if(to_convert[0].length > 0){
        to_convert[0] = [];
    };
    // Clear Div of errors, if there exist one before
    if (errorHandler.hasChildNodes()) { // this function shuld be modularize
        errorHandler.querySelectorAll('*').forEach(element_inside_container => element_inside_container.remove());
    };

    // Convert type of the imput
    let article_cod_input = document.getElementById("input");
    let cod_art = article_cod_input.value;
    const article_codes_to_search = cod_art.split(/,\s*|\s*,\s*|\s+/);

    await article_codes_to_search.forEach(async (article_code_to_search) => {
        // Open browser on resource and search cod_art
        const browser = await puppeteer.launch({
            args: ['--Cross-Origin-Resource-Policy'], 
            headless: true,
            defaultViewport: null
        });
        const page = await browser.newPage();
        await page.goto(url/*, {waitUntil: 'load', timeout: 0}*/);

        try{
            await page.click("#ModalCodigoPostal > div.modal-wrapper.posicion_fija.ingresar-codigo-postal > span");
        }catch(e){
            void e
        }
        await page.waitForSelector("#buscar");
        await page.type("#buscar", article_code_to_search, {delay: 5});
        await page.keyboard.press("Enter");

        // Enter on the URL of the specific prodct
        try{
            await page.click("#ModalCodigoPostal > div.modal-wrapper.posicion_fija.ingresar-codigo-postal > span");
        }catch(e){
            void e
        }
    
        // Go to speccific URL product to scrapp
        let all_the_links = await page.$$eval('a', as => as.map(a => a.href));
        let links_filtered = all_the_links.filter(link => link.includes('art_'));
        let Links_witch_contain_article = Array.from(new Set(links_filtered));
        let [unique_link_to_product] = Links_witch_contain_article;

        // Check if the Article exists or not to go some way
        if(Links_witch_contain_article.length >= 1){
            await page.goto(unique_link_to_product);
            try{
                await page.click("#ModalCodigoPostal > div.modal-wrapper.posicion_fija.ingresar-codigo-postal > span");
            }catch(e){
                void e
            }
                    
            ////////////////////////////////////////// Get all the information needed: //////////////////////////////////////////
            
            // Link/Url
            let link = page.url();
            // Product code on the page, needed to search the images
            let pattern_to_get_codArt = /art_(.+)\//;
            let match = link.match(pattern_to_get_codArt);
            let result = match[1];
            // Images > obtein images, delete images that doesnt contain de product code then delete the duplicates
            let imgSrc = await page.$$eval("img", allimg => allimg.map((val)=> val.getAttribute("src")));
            let regex = new RegExp(result);
            let all_imgs_filtered = imgSrc.filter(item => regex.test(item));
            // Delete duplicates images
            for (let i = 0; i < all_imgs_filtered.length; i++) {
                // Compare the last six characters to the current string, if this is repeated anytime, this remove with splice
                let current_letters = all_imgs_filtered[i];
                let last_six_letters = current_letters.slice(-6);
                
                for (let j = 0; j < all_imgs_filtered.length; j++) {
                    if (i !== j && all_imgs_filtered[j].includes(last_six_letters)) {
                        all_imgs_filtered.splice(i, 1);
                        i--;
                        break;
                    }
                }
            };
                    
            let title = await page.evaluate(() => document.querySelector("#cont_producto > div.clearfix.valign.spa_bot > h1").textContent);
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
                    
            //Push images, then converto single array, so to xlsx file can add the info to the file, then delete all the images thats that contains more than _5.jpg because only need 5 images extras, also remmove elements that doesnt contain "cdnlaol"
            let images_to_push=[];
            all_imgs_filtered = all_imgs_filtered.filter((url_images_check) => {
                return url_images_check.includes("cdnlaol");
            });
            all_imgs_filtered.forEach(image => {
                images_to_push.push(image);
            });
            let img_to_string = images_to_push.join(", ");
            let index = img_to_string.lastIndexOf("_5.jpg");
            if (index !== -1) {
                img_to_string = img_to_string.substring(0, index + 6);
            }
            // Now, separate the first image, and the rest of the images, for separated in columns in the xlsx file
            let firstCommaIndex = img_to_string.indexOf(", ");
            let first_img = img_to_string.substring(0, firstCommaIndex);
            let rest_of_the_imgs = img_to_string.substring(firstCommaIndex + 1);
                    
            //push all the information scrappet so it can be showed on the dom and add latter on the xlsx file
            to_convert[0].push([link, title, descriptcion, article_code, first_img, rest_of_the_imgs]);
                    
            // testing ui loader
            document.getElementById("loaders").style.display = "none";
                    
            // Show on the DOM the XLSX data
            let table = document.createElement("table");
            for (let i = 0; i < to_convert[0].length; i++) {
                let row = document.createElement("tr");
                for (let j = 0; j < to_convert[0][i].length; j++) {
                    let cell = document.createElement("td");
                    cell.innerHTML = to_convert[0][i][j];
                    row.appendChild(cell);
                };
                table.appendChild(row);
            };
            document.getElementById("incoming-data_container").appendChild(table);
            
            // Look information obteined:
            console.log(to_convert[0]);

        }else{
            // Close broser
            await browser.close();

            // Show error product doesnt exist at the moment
            let error_text = "Este producto no existe actualmente en la web de busqueda.";
            let paragraph = document.createElement("p");
            paragraph.textContent = error_text;
            paragraph.style.display = "flex";
            errorHandler.appendChild(paragraph);
        }
    });
};

search.onclick = la_scrap;