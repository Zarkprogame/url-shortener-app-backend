const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport'); 
const cors = require('cors');

const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require('./routes/authRoutes');

require("dotenv").config();

const app = express();

const dbUser = process.env.MONGODB_USER;
const dbPassword = process.env.MONGODB_PASSWORD;

app.use(express.json()); 

app.use(cors({
    origin: "*",
}));

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' } 
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose
    .connect(
        `mongodb+srv://${dbUser}:${dbPassword}@url-shortener-app.fvm4hyy.mongodb.net/?appName=url-shortener-app`
    )
    .then(() => {
        console.log("Conectado a la base de datos de MongoDB!");
    })
    .catch((error) => {
        console.error("Conexión Fallida!", error);
    });

app.use('/api', authRoutes); 
app.use('/api', urlRoutes); 


app.get('/', (req, res) => {
    res.send('Bienvenido a la Api del acortador de Url');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});