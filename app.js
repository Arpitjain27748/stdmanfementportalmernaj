const express =require("express");
const app= express();
require("dotenv").config();
const PORT = process.env.PORT;
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const session= require('express-session');

const webrouter = require("./Routes/router")
const adminrouter = require("./Routes/adminrouter")
const stdrouter = require('./Routes/stdrouter')

app.set("view engine","ejs");
app.set("views","Views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cookieparser())
app.use(session({
    secret:"asdfghjkpoiuytrewqlmnbvcxzASDFGHJKLPOIUYTREWQZXCVBNM0987654321",
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*2}
}))


app.use(express.static("views"));

app.use("/",webrouter);
app.use('/admin',adminrouter)
app.use('/std',stdrouter)

app.get("*",(req,res)=>{
    res.render("notfound")
})


app.listen(PORT,(err)=>{
    if(err){
        console.log(err)
    }
    else{
        console.log(`our application server started at port number:${PORT}`)
    }
})

