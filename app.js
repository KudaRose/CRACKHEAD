const express = require('express');
const session = require('express-session');
const handlebars = require('express-handlebars');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const cron = require('node-cron');
const url = require('node:url');

const app = express();
const port = 3001;

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'crackhead'
});

const updateProducts = cron.schedule('30 3 * * Tuesday', function () {
    scrapers(); // Llama a la función o código en scrapers.js
});

updateProducts.start();

app.engine('handlebars', handlebars.engine({}));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'mysecret', resave: true, saveUninitialized: true }));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows, fields] = await pool.execute('SELECT * FROM usuarios WHERE username = ?', [username]);

        if (rows.length > 0) {
            const match = await bcrypt.compare(password, rows[0].pwrd);

            if (match) { 
                req.session.user = { username };
                res.redirect(url.format({
                    pathname:"/",
                    query: {
                       "message": "logueado!",
                       "msg_type": "success"
                    }
                }));
                return;
            }
        }

        // Muestra la ventana modal de error en el cliente
        res.redirect(url.format({
            pathname:"/",
            query: {
               "message": "Credenciales inválidas!",
               "msg_type": "danger"
            }
        }));
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

// Ruta para mostrar la ventana modal de registro
app.get('/register', (req, res) => {
    res.redirect('/');
});

// Ruta para procesar el formulario de registro
app.post('/register', async (req, res) => {
    const { username, password, mail } = req.body;
    try {
        const salt = await bcrypt.genSalt();
        const hashpw = await bcrypt.hash(password, salt);

        const user = { name: username, password: hashpw };

        await pool.execute(
            'INSERT INTO usuarios (username, pwrd) VALUES (?, ?)',
            [user.name, user.password]
        );

        res.redirect(url.format({
            pathname:"/",
            query: {
               "message": "Registro correcto, inicie sesión",
               "msg_type": "success"
            }
        }));
    } catch (error) {
        console.error(error);
        res.redirect(url.format({
            pathname:"/",
            query: {
               "message": "Registro incorrecto, intente nuevamente",
               "msg_type": "danger"
            }
        }));
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect(url.format({
        pathname:"/",
        query: {
           "message": "Cerraste sesión",
           "msg_type": "info"
        }
    }));
});

// Ruta para la búsqueda
app.get('/search', async (req, res) => {
    const searchQuery = req.query.query;

    try {
        // Realiza una consulta a la base de datos con el valor de búsqueda
        const [rows, fields] = await pool.execute('SELECT * FROM productos WHERE titulo LIKE ?', [`%${searchQuery}%`]);

        // Pasa el resultado de la búsqueda al contexto de Handlebars y renderiza la vista
        res.render('productos', { user: req.session.user, productos: rows, showError: req.query.error });
    } catch (error) {
        console.error('Error en la consulta a la base de datos:', error);
        res.status(500).render('error', { error: 'Error en el servidor' });
    }
});

app.get('/', async (req, res) => {
    try {
        // Consulta los productos desde la base de datos
        const [rows, fields] = await pool.execute('SELECT * FROM productos');
        let message = null;
        if (req.query.message && req.query.msg_type) {
            message = {
                text: req.query.message,
                type: req.query.msg_type
            }
        }
        // Pasa el estado de autenticación y el mensaje de error al contexto de Handlebars
        res.render('productos', { user: req.session.user, productos: rows, message});
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
