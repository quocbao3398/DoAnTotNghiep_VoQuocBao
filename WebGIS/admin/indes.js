// var express = require("express");
// var app = express();
// app.use(express.static("public"));
// app.set("view engine","ejs");
// app.set("views", "./views");
// app.listen(3000);

// app.get("/quantri/list", function(req,res){res.render("quantri_list.ejs");

// });

// app.get("/", function(req, res){res.render("main");
// });
var express = require("express");
const session = require('express-session');
 var app = express();
 app.use(session({
     resave: true,
     saveUninitialized: true,
     secret: 'somesecret',
     cookie: { maxAge: 60000 }
 }));
var http = require('http').createServer(app);
var multer = require("multer");

// var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.listen(3000);
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs')
var path = require('path')
var crypto = require('crypto');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var pg = require('pg');
var config = {
    user: 'postgres',
    database: 'bao',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
}
var pool = new pg.Pool(config);

// //ckeditor
// app.set('view engine', 'ejs');
// app.use(express.static(__dirname + '/admin/public'));
// app.use(bodyParser.urlencoded({ extended: false }));

//ckeditor
var storage = multer.diskStorage({
    //folder upload -> public/upload
    destination: 'public/upload/',
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        cb(null, Math.floor(Math.random()*9000000000) + 1000000000 + path.extname(file.originalname))
      })
    }
  })
  var upload = multer({ storage: storage });
  
  app.set('view engine', 'ejs');
  app.use(express.static(__dirname + '/public'));
  app.use(bodyParser.urlencoded({ extended: false }));
  
  app.get('/', function (req, res) {
    var title = "Plugin Imagebrowser ckeditor for nodejs"
    res.render('index', { result: 'result' })
  })
  
  //show all image in folder upload to json
  app.get('/files', function (req, res) {
    const images = fs.readdirSync('public/upload')
    var sorted = []
    for (let item of images){
        if(item.split('.').pop() === 'png'
        || item.split('.').pop() === 'jpg'
        || item.split('.').pop() === 'jpeg'
        || item.split('.').pop() === 'svg'){
            var abc = {
                  "image" : "admin/public/upload/"+item,
                  "folder" : '/'
            }
            sorted.push(abc)
        }
    }
    res.send(sorted);
  })
  //upload image to folder upload
  app.post('/upload', upload.array('flFileUpload', 12), function (req, res, next) {
      res.redirect('back')
  });
  //delete file
  app.post('/delete_file', function(req, res, next){
    var url_del = 'public' + req.body.url_del
    console.log(url_del)
    if(fs.existsSync(url_del)){
      fs.unlinkSync(url_del)
    }
    res.redirect('back')
  });

// var storage = multer.diskStorage({
//     //folder upload -> public/upload
//     destination: 'public/upload/',
//     filename: function (req, file, cb) {
//       crypto.pseudoRandomBytes(16, function (err, raw) {
//         if (err) return cb(err)
//         cb(null, Math.floor(Math.random()*9000000000) + 1000000000 + path.extname(file.originalname))
//       })
//     }
//   })
//   var upload = multer({ storage: storage });
  
//   app.set('view engine', 'ejs');
//   app.use(express.static(__dirname + 'admin/public'));
//   app.use(bodyParser.urlencoded({ extended: false }));
  
//   app.get('admin/public', function (req, res) {
//     var title = "Plugin Imagebrowser ckeditor for nodejs"
//     res.render('index', { result: 'result' })
//   })
  
//   //show all image in folder upload to json
//   app.get('/files', function (req, res) {
//     const images = fs.readdirSync('./public/upload')
//     var sorted = []
//     for (let item of images){
//         if(item.split('.').pop() === 'png'
//         || item.split('.').pop() === 'jpg'
//         || item.split('.').pop() === 'jpeg'
//         || item.split('.').pop() === 'svg'){
//             var abc = {
//                   "image" : "/./admin/../public/upload/"+item,
//                   "folder" : '/public/upload'
//             }
//             sorted.push(abc)
//         }
//     }
//     res.send(sorted);
//   })
//   //upload image to folder upload
//   app.post('/upload', upload.array('flFileUpload', 12), function (req, res, next) {
//       res.redirect('back')
//   });
//   //delete file
//   app.post('/delete_file', function(req, res, next){
//     var url_del = 'public' + req.body.url_del
//     console.log(url_del)
//     if(fs.existsSync(url_del)){
//       fs.unlinkSync(url_del)
//     }
//     res.redirect('back')
//   });
  


app.use('/public', express.static('public'));

app.get("/quantri/trangchu", function(req, res){
    res.render("trangchu.ejs");
})

app.get("/quantri/list", function(req, res) {
    pool.connect((err, client, release) => {
        if (req.session.username)
        {
            if (err) {
                return console.error('Error acquiring client', err.stack)
            }
            client.query('SELECT * FROM diemditich1_font_point ', (err, result) => {
                release()
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                // console.log(result.rows[0].ten_chu_ho);
                res.render("quantri_list.ejs", { danhsach: result });
    
            });
        }
        else{
            res.redirect('/login');
        }
       
    });
});
//dang xuat
app.get("/logout", function(req, res) {
    //show form
    req.session.destroy();
    res.redirect('/login');
});


app.get("/quantri/them", function(req, res) {
    //show form
    res.render("them.ejs");
});

app.post("/quantri/them", urlencodedParser, function(req, res) {
    //insert db
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        var tenditich = req.body.txttenditich;
        var thoiky = req.body.txtthoiky;
        var diachi = req.body.txtdiachi;
        // var lichsuhinhthanh = req.body.txtlichsuhinhthanh;
        var kientruc = req.body.txtkientruc;
        var ngaycongnhan = req.body.txtngaycongnhan;
        var tdx = req.body.txtX;
        var tdy = req.body.txtY;
        var lichsuhinhthanh = req.body.lichsuhinhthanh1;
        client.query("insert into diemditich1_font_point (tenditich,thoiky,diachi,lichsuhinhthanh,kientruc,ngaycongnhan,geom) values ('" + tenditich + "','" + thoiky + "','" + diachi + "','" + lichsuhinhthanh + "','" + ngaycongnhan + "','" + kientruc + "','SRID=4326;POINT(" + tdx + " " + tdy + ")')", (err, result) => {
            release()
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            // console.log(result.rows[0].ten_chu_ho);
            res.redirect("../quantri/list");
        });
    });


});

app.get("/quantri/sua/:gid", function(req, res) {
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        var gid = req.params.gid;
        client.query("SELECT * FROM diemditich1_font_point WHERE gid='" + gid + "'", (err, result) => {
            release()
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            console.log(result.rows[0]);

            res.render("quantri_edit.ejs", { hd: result.rows[0] });
        });
    });
});

app.post("/quantri/sua", urlencodedParser, function(req, res) {
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        var id = req.body.txtid;
        var tenditich = req.body.txttenditich;
        var thoiky = req.body.txtthoiky;
        var diachi = req.body.txtdiachi;
        // var lichsuhinhthanh = req.body.txtlichsuhinhthanh;
        var kientruc = req.body.txtkientruc;
        var ngaycongnhan = req.body.txtngaycongnhan;
        var tdx = req.body.txtX;
        var tdy = req.body.txtY;
        var lichsuhinhthanh = req.body.lichsuhinhthanh1;
        client.query("UPDATE diemditich1_font_point SET tenditich='" + tenditich + "', thoiky='" + thoiky + "', diachi='" + diachi + "',kientruc='" + kientruc + "',ngaycongnhan='" + ngaycongnhan + "',lichsuhinhthanh='"+lichsuhinhthanh +"',geom='SRID=4326;POINT(" + tdx + " " + tdy + ")' WHERE gid = " + id + "  ", (err, result) => {
            release()
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            // console.log(result.rows[0].ten_chu_ho);
            res.redirect("../quantri/list");
        });
    });

})

app.get("/quantri/xoa/:gid", function(req, res) {
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        var gid = req.params.gid;
        client.query("DELETE FROM diemditich1_font_point WHERE gid='" + gid + "' ", (err, result) => {
            release()
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            // console.log(result.rows[0].ten_chu_ho);
            res.redirect("../../quantri/list");
        });
    });
})

app.get("/quantri/tintuc1", function(req, res) {
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT * FROM baiviet ', (err, result) => {
            release()
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            // console.log(result.rows[0].ten_chu_ho);
            res.render("tintuc1.ejs", { danhsach: result });

        });
    });
});

//login
// app.get("/quantri/login", function(req, res) {
//     //show form
//     res.render("login.ejs");
// });
app.get("/login", function(req, res) {
    res.sendFile('/public/login1/login.html', { root: __dirname });
});

app.post("/login", urlencodedParser, function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT * FROM "user" WHERE tk=$1 AND mk=$2  LIMIT 1', [username, password], function(err, result) {
            release()
            if (username == 'admin') 
            {
                var sessData = req.session;
                 sessData.username = username;
                res.redirect("/quantri/trangchu");

            } 
            else {
                res.redirect("/");
            }

        });

    });
});


app.get("/", function(req, res) {
    res.render("main");
})