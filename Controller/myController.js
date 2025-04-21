let model = require('../Models/model')



// let loginuserobjstatic = {
//     name: 'ar',
//     role: null,
//     id: 123456789
// }
loggedinusearray = []
module.exports = {
    home: (req, res) => {
        res.render("index");
    },
    about: (req, res) => {
        res.render("about");
    },
    services: (req, res) => {
        res.render("services", { servcount: null })
    },
    loginge: (req, res) => {
        res.render("login", { msg: null, type: null })
    },
    loginpost: (req, res) => {
        // console.log(req.body)
        let logininfo = req.body
        // adminid and adminpassword hi std ke liye bhi same input name diye hai
        if (!logininfo.adminid || !logininfo.adminpassword) {
            res.render("login", { msg: "pls enter login id and password", type: "alert-danger" })
        }
        else {
            function checkstatus(params) {
                let st = false;
                loggedinusearray.filter((user) => {
                    if (logininfo.adminid == user.email || logininfo.id == user.mobile) {
                        st = true
                    } else {
                        st = false
                    }
                })
                return st;
            }
            let loginstatus = checkstatus();
            if (loginstatus === true) {
                res.render('/login', { msg: "given user id already loggedin", type: 'alert-danger' })
            } else {


                model.login(logininfo, (loginresult, datauser) => {
                    switch (loginresult) {
                        case 'notfound':
                            res.render("login", { msg: "enter login id not found in database", type: "alert-danger" })
                            break;
                        case 'invalidpassword':
                            res.render("login", { msg: "enter login id and passwprd not matched", type: "alert-danger" })
                            break;
                        case 'blocked':
                            res.render("login", { msg: "enter login id blocked by admin pls contact admin", type: "alert-danger" })
                            break;
                        case 'notverified':
                            res.render("login", { msg: "enter login id's email is not verified", type: "alert-danger" })
                            break;

                        case 'admin':
                            loggedinusearray.push(datauser);
                            // console.log(loggedinusearray[0].name)
                            req.session.user = datauser
                            // res.render("adminhome", { loginuser: datauser })
                            res.redirect('/admin')
                            // redirect = root par jata hai and render page par- to redirect karane se safe banega jisse back btn kaam nhi karega
                            break;
                        default:
                            loggedinusearray.push(datauser);
                            req.session.user = datauser
                            // res.render("stdhome", { loginuser: datauser })
                            res.redirect('/std')
                            break;
                    }
                })
            }
        }
    },
    checkuserlogin: (req, res, next) => {
        if (req.session.user != null) {
            next()
        } else {
            res.render('login', { msg: "you are not logged in for accesing services", type: "alert-danger" })
        }
    }
    ,
    logout: (req, res) => {
        if (req.session.user != null) {
            req.session.destroy((err, result) => {
                if (err) {
                    console.log('error in logout:', err)
                } else {
                    console.log('logout successfull...', result)
                }
                loggedinusearray.pop();
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.clearCookie('connect.sid').redirect('/')
            })
        } else {
            res.render('login', { msg: "you are not logged in for logging out", type: 'alert-danger' })
        }
    }
    ,
    contactget: (req, res) => {
        res.render("contact", { msg: null, type: null })
    },
    contactpost: (req, res) => {
        let contactinfo = req.body;

        if (!contactinfo.uname || !contactinfo.phone || !contactinfo.city) {
            res.render("contact", { msg: "you entered incomplete details, please enter required fileds", type: 'alert-danger' });
        }
        else {
            model.savecontact(contactinfo, (resultcontact) => {
                res.render("contact", { msg: "your message sent..." + resultcontact, type: "alert-success" })
            })

        }
    }
    ,
    contactlistget: (req, res) => {
        model.getallcontactlist((cnclist_result) => {
            switch (cnclist_result) {
                case 'notfound':
                    res.render('contactlist', { contactlist: cnclist_result, type: 'danger' ,loginuser:null })
                    break;

                default:
                    res.render('contactlist', { contactlist: cnclist_result, type: 'success' , loginuser:req.session.user})
                    break;
                }
            })
        },
        contactdelete: (req, res) => {
            let id = req.params.id;
            model.deletecontact(id, (deleteresult, newcnclist_result) => {
                // res.redirect('/admin/contactlist')
                // here; or you can use call back to render and send objet with render
                res.render('contactlist', { contactlist: newcnclist_result, type: 'success' ,loginuser:req.session.user })

        })
    },
    // admin controller

    adminhome: (req, res) => {
        res.setHeader('Cache-Control', 'no-cache', 'no-store', 'must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0')
        res.render('adminhome', { loginuser: req.session.user })
    },
    studenthome: (req, res) => {
        res.setHeader('Cache-Control', 'no-cache', 'no-store', 'must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0')
        res.render('stdhome', { loginuser: req.session.user })
    },
    adminregisterget: (req, res) => {

        res.render('adminregister', { msg: null, type: null, loginuser: req.session.user })
    },

    // register controller
    adminregisterpost: (req, res) => {
        let userdata = req.body;
        let userphoto = { p: req.file.buffer, f: req.file.mimetype }
        console.log(userdata)
        if (false) {
            res.render('adminregister', { msg: 'pls enter all required fields', type: "alert-danger" })
        }
        else {
            model.saveuser(userdata, userphoto, (registraionresult) => {
                switch (registraionresult) {
                    case 'already':
                        res.render('adminregister', { msg: "entered mobile or email is already registered", type: 'alert-danger' ,loginuser:req.session.user })
                        break;
                    default:
                        res.render('adminregister', { msg: `Dear ${userdata.urname} your registraion sucessful and`, type: 'alert-success',loginuser:req.session.user })
                        break;
                }
            })

        }
    },

    // user verification

    userverfication: (req, res) => {
        let verifyinfo = req.body;
        if (!verifyinfo.email || !verifyinfo.otp) {
            res.render('adminregister', { msg: 'pls enter email or otp', type: 'alert-danger',loginuser:req.session.user  })
        }
        else {
            model.verify(verifyinfo, (verifyresult, datauser) => {
                switch (verifyresult) {
                    case 'notfound':
                        res.render('adminregister', { msg: 'entered email is not yet registered, first register this user or try with registered email', type: 'alert-danger',loginuser:req.session.user })
                        break;
                    case 'invalid':
                        res.render('adminregister', { msg: 'otp not matchd please enter a vailid otp', type: 'alert-danger',loginuser:req.session.user })
                        break;
                    default:
                        res.render('adminregister', { msg: 'email verified succesfilly...Now user can login his/her profile', type: 'alert-success' ,loginuser:req.session.user})
                        break;
                }
            })
        }
    }

    ,
    adminprofille: (req, res) => {
        // let adminid = req.session.user
        model.getprofileinfo(req.session.user.email, (userdata) => {
            // console.log('ghj'+userdata)
            // console.log(userdata
            res.render('adminprofie', { loginuser: userdata, msg: null, type: null })
        })

    }
    ,
    adminupdate: (req, res) => {
        let updatedata = req.body;
        let updatephoto = { p: req.file.buffer, f: req.file.mimetype };

        //    console.log(updatedata)
        //      
        if (!updatedata.urname || !updatedata.urmobile || !updatedata.role || !updatedata.urdob || !updatedata.urpwd || !updatedata.uragree) {
            model.getprofileinfo(updatedata.uremail, (datauser) => {
                res.render('adminprofie', { msg: 'pls enter all required fields', type: 'alert-danger', loginuser: datauser })
            })
        }
        else {
            model.updateprofile(updatedata, updatephoto, (updateresult, updateinfo) => {
                switch (updateresult) {
                    case 'already':
                        res.render('adminprofie', { msg: 'update mobile or email is already registered with other user', type: 'alert-danger', loginuser: updateinfo });
                        break;
                    default:
                        res.render('adminprofie', { msg: `dear ${updatedata.urname}, your profile updated successfully...${updateresult}`, type: 'alert-success', loginuser: updateinfo })
                }
            })
        }
    }
    , cookiecreate: (req, res) => {
        // res.cookie('name','myfirstcookie').render('index')
        // console.log(req.cookies)
        res.cookie('name', 'my expiring cookies', { expire: 10000 + Date.now() }).render('index')
        // res.cookie('name','cookie with max age',{maxAge:10000}).render('index')
    },

    cookieclear: (req, res) => {
        res.clearCookie('name').render('index')
    },
    getuserlist:(req,res)=>{
        model.getresteredstdlist((stdlist_result)=>{
            switch (stdlist_result) {
                case 'notfound':
                    res.render('viewstd',{loginuser:req.session.user})
                    break;
                default:
                    res.render('viewstd',{loginuser:req.session.user,studentlist:stdlist_result})
                    break;
            }
        })
    },
    userprofileget:(req,res)=>{
        let userid= req.params.email
        model.getprofileinfo(userid,(datauser)=>{
            res.render('adminprofie',{loginuser:datauser, msg:null,type:null});
        })
    },
    userprofileblock:(req,res)=>{
        let userid= req.params.email
        model.blockprofile(userid,(blockresult)=>{
            res.redirect('/admin/registestdlist')
        })
    },
    userdelete: (req, res) => {
        let id = req.params.id;
        model.deleteuser(id, (deleteresult, newuserlist_result) => {
            // res.redirect('/admin/contactlist')
            // here; or you can use call back to render and send objet with render
            res.redirect('/admin/registestdlist')
    })
}
}