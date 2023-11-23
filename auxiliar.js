const puppeteer = require('puppeteer');

async function obtenerEnlacesProductos(url) {
    const browser = await puppeteer.launch({
        headless: 'new',
        // `headless: true` (default) enables old Headless;
        // `headless: 'new'` enables new Headless;
        // `headless: false` enables “headful” mode.
    });
    const page = await browser.newPage();

    try {
        await page.goto('https://www.solodeportes.com.ar/calzado.html', { waitUntil: 'domcontentloaded' });

        // Puedes ajustar el selector según la estructura de la página web
        const enlacesProductos = await page.evaluate(() => {
            const enlaces = [];

            // Reemplaza 'selector_del_enlace_producto' con el selector CSS del enlace de cada producto
            document.querySelectorAll(".product.photo.product-item-photo").forEach((enlace) => {
                enlaces.push(enlace.getAttribute('href'));
            });

            return enlaces;
        });

        return enlacesProductos;
    } finally {
        await browser.close();
    }
}

// Reemplaza 'https://www.ejemplo.com/catalogo' con la URL real de la página de catálogo
const urlCatalogo = 'https://www.solodeportes.com.ar/calzado.html';

obtenerEnlacesProductos(urlCatalogo).then((enlaces) => {
    console.log('Enlaces de productos:', enlaces);
});