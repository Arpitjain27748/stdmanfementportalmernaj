const express = require("express");
const myController = require("../Controller/myController");
const adminrouter = express.Router();

const multer = require('multer');
const { model } = require("mongoose");
const mystorage = multer.memoryStorage();
const upload = multer({ storage: mystorage })

adminrouter.get('/', myController.checkuserlogin, myController.adminhome);
adminrouter.get('/register', myController.checkuserlogin, myController.adminregisterget);
adminrouter.get('/viewprofile', myController.checkuserlogin, myController.adminprofille);
adminrouter.get('/contactlist', myController.checkuserlogin, myController.contactlistget);
adminrouter.get('/delete/:id', myController.checkuserlogin, myController.contactdelete)
adminrouter.get('/registestdlist',myController.checkuserlogin,myController.getuserlist)
adminrouter.get('/userprofileget/:email',myController.checkuserlogin,myController.userprofileget)
adminrouter.get('/userprofileblock/:email',myController.checkuserlogin,myController.userprofileblock)
adminrouter.get('/userprofiledelete/:id',myController.checkuserlogin,myController.userdelete)

adminrouter.post('/register', myController.checkuserlogin, upload.single('stdphoto'), myController.adminregisterpost);
adminrouter.post('/adminupdate', myController.checkuserlogin, upload.single('stdphoto'), myController.adminupdate)
adminrouter.post('/verifyuser', myController.checkuserlogin, myController.userverfication);

module.exports = adminrouter;