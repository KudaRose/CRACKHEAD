const puppeteer = require('puppeteer');
const pg = require('pg');

async function insertar(producto, connection) {
    try {
        const urlproducto = producto.url
        if (urlproducto.substring(0, 1) == '/') {
            console.log(producto.url);
            producto.url = producto.urlPagina + producto.url
            console.log(producto.url);
        }
        const [result] = await connection.query(
            'INSERT INTO "productos" (srcimg, titulo, precio, tienda, url) VALUES ($1, $2, $3, $4, $5)',
            [producto.SRCimgs, producto.titles, producto.prices, producto.tienda, producto.url]
        );

        //console.log(`Producto insertado con ID: ${result.insertId}`);
    } catch (error) {
        console.error('Error al insertar el producto:', error);
    }
}

async function establecerConexion() {
    return await new pg.Pool({
        host: 'sql10.freemysqlhosting.net',
        user: 'sql10668030',
        password: 'drZNPzFflk',
        database: 'sql10668030'
    });
    
}

const obtenerProductos = async (browser, storedata) => {
    const page = await browser.newPage();
    await page.goto(storedata.urlCatalogo, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(storedata.container);
    //console.log(storedata);
    try {
        // Código de extracción de productos
        const enlacesProductos = await page.evaluate((storedata) => {
            const prods = [];
            //for (const prod of productos) {
            document.querySelectorAll(storedata.container).forEach((prod) => {
                const srcImgElement = prod.querySelector(storedata.SRCimgs);
                const titleElement = prod.querySelector(storedata.titles);
                const priceElement = prod.querySelector(storedata.prices);
                const urlElement = prod.querySelector(storedata.url);
                prods.push({
                    SRCimgs: srcImgElement ? srcImgElement.getAttribute('src') : prod,
                    titles: titleElement ? titleElement.innerText : "",
                    prices: priceElement ? priceElement.innerText : "",
                    tienda: storedata.store,
                    url: urlElement ? urlElement.getAttribute('href') : "",
                    urlPagina: storedata.urlCatalogo
                });
            });

            return prods;
        }, storedata);

        return enlacesProductos;
    } catch (error) {
        console.error('Error durante la extracción de productos:', error);
        return []; // Devuelve un array vacío en caso de error
    }
}


async function main() {
    try {
        // Establece la conexión
        const connection = await establecerConexion();

        const browser = await puppeteer.launch({
            args: ['--mute-audio', '--disable-features=NetworkService,OutOfBlinkCors', '--disable-extensions'],
            headless: false,
            dumpio: true,
        });

        const paginas = [
            {
                container: ".product-item-info",
                SRCimgs: ".product-image-photo",
                titles: ".product-item-name",
                prices: ".price",
                store: "Solo Deportes",
                urlCatalogo: 'https://www.solodeportes.com.ar/calzado.html',
                url: 'a'
            },
            {
                container: '.product',
                SRCimgs: '.tile-image',
                titles: '.link',
                prices: '.sales',
                store: 'Dexter',
                urlCatalogo: 'https://www.dexter.com.ar/calzado',
                url: 'a'
            },
            {
                container: '.product',
                SRCimgs: '.tile-image',
                titles: '.link',
                prices: '.sales',
                store: 'Moov',
                urlCatalogo: 'https://www.moov.com.ar/zapatillas',
                url: 'a'
            }, {
                container: '.product-item-info',
                SRCimgs: '.product-image-photo',
                titles: '.product-item-link',
                prices: '.normal-price',
                store: 'OpenSports',
                urlCatalogo: 'https://www.opensports.com.ar/hombre/zapatillas.html',
                url: 'a'
            }, {
                container: '.product-item-info',
                SRCimgs: '.product-image-photo',
                titles: '.product-item-link',
                prices: '.normal-price',
                store: 'OpenSports',
                urlCatalogo: 'https://www.opensports.com.ar/mujer/zapatillas.html',
                url: 'a'
            }, {
                container: '.product-tile',
                SRCimgs: '.tile-image',
                titles: '.link',
                prices: '.value',
                store: 'Stock Center',
                urlCatalogo: 'https://www.stockcenter.com.ar/zapatillas',
                url: '.link'
            }
        ];

        await connection.query('delete from productos');
        for (const pagina of paginas) {
            const productos = await obtenerProductos(browser, pagina);
            //console.log(productos);
            for (const producto of productos) {
                await insertar(producto, connection);
            }
        }

        // Cierra la conexión después de realizar las operaciones
        await connection.end();
        await browser.close();
    } catch (error) {
        console.error('Error en la función principal:', error);
    }
}
main();
module.exports = main;