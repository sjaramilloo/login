const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const connection = require('./database/db');
const res = require('express/lib/response');

// app.get('/', (req, res) => {
//     res.render('index', { msg: 'Yeferson shut up' });
// })

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', { user: user, name: name, rol: rol, pass: passwordHaash }, async (error, result) => {
        if (error) {
            console.log(error);
        } else {
            res.render('register', {
                alert: true,
                alertTitle: "Registration",
                alertMessage: "Registro correcto",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            })
        }
    })
})

app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if (user && pass) {
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, result) => {
            if (result.length == 0 || !(await bcryptjs.compare(pass, result[0].pass))) {
                res.render('login', {
                    alert: true,
                    alertTitle: 'Error',
                    alertMessage: "Usuario y/o pasword incorrecto",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: 1500,
                    ruta: 'login'
                });
            } else {
                req.session.loggedin = true;
                req.session.name = result[0].name
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexión exitosa",
                    alertMessage: "Login correcto",
                    alertIcon: "success",
                    showConfirmButton: true,
                    timer: 1500,
                    ruta: ''
                })   
            }
        })     

    }else{
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "por favor ingrese un usuiario y/o password",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: 1500,
            ruta: 'login'
        })
    }
})

app.get('/', (req, res) => {
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            name: req.session.name
        });
    }else{
        res.render('index',{
        login: false,
        name: 'Debes de iniciar sesion'
        })
    }
})

app.listen(3000, (req, res) => {
    console.log('Mierda está corriendo aquí http://localhost:3000');
})