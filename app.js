require('dotenv').config();

const express=require('express');
const expressLayout = require('express-ejs-layouts');


const cookieParser= require('cookie-parser');
const session = require('express-session');
const MongoStore= require('connect-mongo');

const methodOverride = require('method-override');

// const router=require('./server/routes/main');

const connnetDB=require('./server/config/db');

const app=express();
const PORT=5000||process.env.PORT;

//connect to DB 
connnetDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
  }));


app.use(express.static('public'));


 
// Templating Engine
app.use(expressLayout);
// Set the path to the layout file
app.set('layout', './layouts/main');       // yahi par set kardia ki main.ejs file khulegi hamesha { uske ander body change hoti rahegi according to request ((like 127.0.0.1:5000 => isse index.ejs file ka data render hoga)) }
// Set the view engine to EJS
app.set('view engine', 'ejs');




// app.get('',(req,res)=>{
//      res.send('Hello wORLD');
// });

// app.use('/',router);
app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));



app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}`);
});