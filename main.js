// imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

//database connection "mongodb://localhost:27017/eventdb?authSource=admin"
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on('error',(error) => console.log(error));
db.once('open',() => console.log('Connected to the database!!'));

//milddlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());


app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use((req,res,next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static("uploads"));
//set template engine
app.set("view engine","ejs");


// load static assets
app.use('/static',express.static(path.join(__dirname,'public')))
//route prefix
app.use("",require("./routes/routes"));

app.listen(PORT,()=>{
    console.log(`Server started at http://localhost:${PORT}`);
})