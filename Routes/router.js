const express = require("express");
const webrouter = express.Router();
const mongoose = require("mongoose");
const myController = require("../Controller/myController");
// const cookie

webrouter.get("/", myController.home );
webrouter.get("/about",myController.about);
webrouter.get("/services",myController.services);
webrouter.get("/login", myController.loginge);
webrouter.get('/logout',myController.logout)
webrouter.get('/cookie',myController.cookiecreate);
webrouter.get('/cookiedelete',myController.cookieclear);
webrouter.get('/session',(req,res)=>{
    if (req.session.pagecount) {
        req.session.pagecount++;
        res.render('services',{servcount:req.session.pagecount})
    } else {
        req.session.pagecount=1;
        res.render('services',{servcount:1})
    }
})

webrouter.post("/login", myController.loginpost);
webrouter.post("/stdlogin", myController.loginpost);
webrouter.get("/contact",myController.contactget );
webrouter.post("/contact", myController.contactpost);

module.exports = webrouter;