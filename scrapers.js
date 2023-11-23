const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
async function establecerConexion() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'crackhead'
    });
}


const obtenerProductos = async (browser, storedata) => {
    const page = await browser.newPage();
    page
        .on('console', message =>
            console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    await page.goto(storedata.urlCatalogo, { waitUntil: 'domcontentloaded' });
    console.log(storedata);
    const enlacesProductos = await page.evaluate((storedata) => {
        const prods = [];
        document.querySelectorAll(storedata.container).forEach((prod) => {
            const srcImgElement = prod.querySelector(storedata.SRCimg);
            const titleElement = prod.querySelector(storedata.title);
            const priceElement = prod.querySelector(storedata.price);
            const disciplineElement = prod.querySelector(storedata.discipline);
            const urlElement = prod.querySelector('a');
            prods.push({
                SRCimg: srcImgElement ? srcImgElement.getAttribute('src') : "",
                title: titleElement ? titleElement.innerText : "",
                price: priceElement ? priceElement.innerText : "",
                tienda: storedata.store,
                discipline: disciplineElement ? disciplineElement.innerText : "",
                url: urlElement ? urlElement.getAttribute('href') : "",
            });
        });
        return prods;
    }, storedata.store);

    return enlacesProductos;
}

async function insertar(producto, connection) {
    try {
        console.log(producto.SRCimg);
        console.log(producto.title);
        console.log(producto.discipline);
        console.log(producto.tienda);
        console.log(producto.url);
        // Ejecuta la consulta SQL para insertar el producto
        const [result] = await connection.execute(
            'INSERT INTO productos (SRCimg, titulo, categoria, tienda, URL) VALUES (?, ?, ?, ?, ?)',
            [producto.SRCimg, producto.title, producto.discipline, producto.tienda, producto.url]
        );

        console.log(`Producto insertado con ID: ${result.insertId}`);
    } catch (error) {
        console.error('Error al insertar el producto:', error);
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
                disciplines: ".product-item-type",
                prices: ".price",
                store: "Solo Deportes",
                urlCatalogo: 'https://www.solodeportes.com.ar/calzado.html'
            },
            {
                container: ".product",
                SRCimgs: ".tile-image",
                titles: ".link",
                disciplines: ".product-item-type",
                prices: ".sales",
                store: "Dexter",
                urlCatalogo: 'https://www.dexter.com.ar/calzado'
            },
            {
                container: ".product",
                SRCimgs: ".tile-image",
                titles: ".link",
                disciplines: ".product-item-type",
                prices: ".sales",
                store: "Moov",
                urlCatalogo: 'https://www.moov.com.ar/zapatillas'
            }
        ];

        for (const pagina of paginas) {
            const productos = await obtenerProductos(browser, pagina);
            console.log(productos);
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
