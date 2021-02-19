const express = require('express');
const multer = require('multer');
const path = require('path');

//------------------------

var cookieParser = require('cookie-parser');
var session = require('express-session');
//-----------------------------------------------


let bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
bodyParser = bodyParser.urlencoded({
    extended: false
})

var home = require("./controlers/home");
var admin = require("./controlers/admin");
var user = require("./controlers/user");
var config = require("./controlers/config");
var auth = require("./controlers/auth");
// var items = require("./controlers/items");
var products = require("./controlers/products");
var fs = require("fs");
var productArray = [];


if (fs.existsSync("db/product.json")) {
    fs.readFile("db/product.json", function (err, data) {
        productArray = JSON.parse(data);
    });
}

//set storge engine
const storge = multer.diskStorage({
    destination: './public/upload',
    filename: function (req, file, cb) {
        cb(null, `${productArray.length == 0 ? 1 :Number(productArray[productArray.length - 1].productID) + 1}-${req.body.productName}-${Date.now()}-${file.originalname}`);
    }
});

//init upload 
const upload = multer({
    storage: storge,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single("image");


//check File Type
function checkFileType(file, cb) {
    //allowed exteion
    const fileTypes = /jpeg|jpg|png|gif/;

    //check extetion
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    //check mime
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb({
            message: 'Images Only'
        });
    }

}


// init app
const app = express();
const port = 3200;

//ejs
app.set('view engine', 'ejs');

//-----------------------------------------------
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));
//-----------------------------------------------

// public folder
app.use(express.static('./public/upload'));
// app.use(express.static('./upload'));
app.use(express.static('./public'));
app.use('/users/assets', express.static(__dirname + '/public/assets'));
app.use('/home/assets', express.static(__dirname + '/public/assets'));
app.use('/admin/assets', express.static(__dirname + '/public/assets'));
app.use('/products/assets', express.static(__dirname + '/public/assets'));
app.use('/assets', express.static(__dirname + '/public/assets'));
app.use('/upload', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('index', {
    msg: '',
    err: -1,
    login: req.session.name?'ok':'no'
}));

app.use('/products', express.static("./public/upload"));
app.get("/login.html", auth.controler.loginView)
app.get("/register.html", auth.controler.registerView)
app.post("/login.html", bodyParser, auth.controler.login)
app.post("/register.html", bodyParser, auth.controler.register)



app.get("/products/productList.html", products.controler.allproductsView)
app.get("/products/productList.html/:id", products.controler.productsViewByPage)
app.post("/products/add.html", bodyParser, products.controler.add)
app.delete("/products/delete.html/:id", bodyParser, products.controler.delete)

app.get("/home.html/logout", home.controler.logout);
app.get("/home.html", home.controler.homeView);

app.get("/products/productDetails.html/:pram", products.controler.productitem)


app.get("/admin/addproduct.html", admin.controler.addproduct)
app.get("/admin/home.html", admin.controler.adminView)

//added by ahmed
app.get("/admin/productControl.html", admin.controler.adminProductControl)


app.get("/users/user.html", user.controler.viwe)
app.post("/users/edituser.html", bodyParser, user.controler.edit)
app.delete("/users/deleteuser.html/:id", bodyParser, user.controler.delete)





app.listen(port, () => console.log(`Server started on port ${port}`))