const express = require('express');
const mysql = require('mysql');
const exphbs = require('express-handlebars');



const app = express();
const port = 3000;



// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'crackhead'
});

app.engine('handlebars', exphbs.engine({}));
app.set('view engine', 'handlebars');

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);

    } else {
        console.log('Conexión a MySQL establecida');
    }
});

app.get('/', (req, res) => {
    // Consultar los datos de la base de datos
    connection.query('SELECT SRCimg, titulo, categoria, tienda, URL FROM productos', (err, results) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            // Guardar los resultados en un array
            const productosArray = results;

            // Renderizar la vista 'productos.handlebars' con los datos de la base de datos
            res.render('productos', { productos: productosArray });
        }
    });
});

app.get('/updateProducts'){

}




// Resto de la configuración de Express y rutas

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
