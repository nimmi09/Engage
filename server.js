const express = require("express");
 
//const { client } = require("./dbConfig");
const { client }= require("./database");
const multer = require('multer');
//const upload = multer({dest: __dirname + '/uploads'});
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const {PythonShell} =require('python-shell');
const app = express();
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/uploads/temp')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
  }
})

const upload = multer({ storage: storage })
let storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/uploads/search')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
  }
})

const searchupload = multer({ storage: storage1 })


const initializePassport = require("./passport-config");
const req = require("express/lib/request");
const { range } = require("express/lib/request");
const { sql_helper } = require("./sql-helper");
const { image } = require("./image");
const {user} =require('./user');
const {offender} =require('./offender');
const {victim} =require('./victim');

const {location} =require('./location');
const {offence} =require('./offence');
const {categories} =require('./category');
const { string_utility } =require('./string-utility');
const { type } = require("express/lib/response");

initializePassport(passport);
client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static('views'));

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});
app.get("/users/super", checkNotAuthenticated, (req, res) => {
  res.render("super.ejs");
});
app.get("/search", checkNotAuthenticated, (req, res) => {
  res.render("search.ejs");
});
app.get("/accept/:type/:uid", checkNotAuthenticated, (req, res) => {
if (req.params.type=='user'||req.params.type=='admin'|| req.params.type=='super'){
  sql_helper.accept_user(uid);
 }
 else if(req.params.type=='offender'){
sql_helper.accept_offender (uid)

 }
  
      if (req.params.type=='user'){
        res.redirect("/users/requests/user");
      }
      else if (req.params.type=='admin'){
        res.redirect("/users/requests/admin");
      }
      else if(req.params.type=='offender'){
        res.redirect("/users/requests/offender");
      }
    }); 
  
app.get("/reject/:type/:uid", checkNotAuthenticated, (req, res) => {
 
    if(req.params.type=='user'|| req.params.type=='admin'|| req.params.type=='super'){
sql_helper.reject_user(uid)
     
   
    }
    if(req.params.type=='offender'){
      sql_helper.reject_offender(uid)
           
         
          }
    if (type=='user'){
      res.redirect("/users/requests/user");
    }
    else if (type=='admin'){
      res.redirect("/users/requests/admin");
    }
    else if(req.params.type=='offender'){
        res.redirect("/offender_requests");
       
      
    }
  }
        
);   
    
 
    
    app.get("/users/requests/:type", checkNotAuthenticated, (req, res) => {
      if(req.params.type=='user' && req.user.type=='admin' || req.user.type=='super'){
        //var results=sql_helper.user_requests(req.params.type);
      sql_helper.user_requests(req.params.type,function(err,results){
       
        if (err==undefined){
          requests=Array.from(results.rows);
          console.log(requests);
          //console.log('res',res);

          res.render("requests.ejs",{requests});
        }
       
      });
    
        }
    else {
      res.render("error.ejs");
    } 

 
});
app.get("/offender_requests", checkNotAuthenticated, (req, res) => {
  
  if(req.user.type=='user' || req.user.type=='admin' || req.user.type=='super'){
    //var requests=sql_helper.offender_requests();
    sql_helper.offender_requests(function(err,results){
       
      if (err==undefined){
        requests=Array.from(results.rows);
        

        res.render("offender_requests.ejs",{requests});
      }
     
    });

 

}
else {
  res.render("error.ejs");
} 
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  
  res.render("login.ejs");
});


app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  
  res.render("dashboard.ejs");
});

app.get("/users/admin", checkNotAuthenticated, (req, res) => {
  
  res.render("admin.ejs");
});

app.get("/users/superd", checkNotAuthenticated, (req, res) => {
  
  res.render("superd.ejs");
});
app.get("/add_offender", checkNotAuthenticated, (req, res) => {
  sql_helper.get_offence_categories(function(err,results){
       
    if (err==undefined){
      
      var category=Array.from(results.rows);
      
      sql_helper.get_locations(function(err,results){
       
        if (err==undefined){
          
          locations=Array.from(results.rows);
          
         
          res.render("add_offender.ejs",{locations,category});
        }
       
      });
    
    }
   
  });
  

  
 
});

app.get("/users/logout", (req, res) => {
  req.logout();
  res.render("index.ejs", { message: "You have logged out successfully" });
});

app.post("/users/register", async (req, res) => {
 
  let {type, name, email,desg, password, password2 } = req.body;
  
  let errors = []
  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
  
    res.render("register.ejs", { errors,type, name, email,desg, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    
    var requests= sql_helper.fetch_users(email);
    if (requests.length > 0) {
     
      return res.render("register", {
        message: "Email already registered"
      });
    }
        
        

        //if (results.rows.length > 0) {
          //console.log('show')
          //return res.render("register", {
            //message: "Email already registered"
          //});}
         else {
          let User=new user(type,name, email,desg, hashedPassword);

          //console.log(User)
          var status=sql_helper.add_user(User);
          if (status=='success'){
            req.flash("success_msg", "You are now registered. Please log in");
            res.redirect("/users/login");
          }
          
        }
      
  

}
});

app.post( "/users/login",
  passport.authenticate("local", {
    
   
    failureRedirect: "/users/login",
    failureFlash: true
  }) , (req,res) => {
    
    if (req.user.type=='super') {
      res.redirect('/users/superd');
    }
    if (req.user.type=='user'){
      res.redirect('/users/dashboard');
    }
    if (req.user.type=='admin'){
      res.redirect('/users/admin');
    }
  }
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}


app.post("/users/super", async (req, res) => {
  let {type, id,name, email,desg, password, password2 } = req.body;
  
  let errors = [];
  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    //console.log('123')
    res.render("super.ejs", { errors,type,id, name, email,desg, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    //console.log(hashedPassword)
    // Validation passed
    client.query(
            `INSERT INTO users (type,user_id,user_name, email,user_designation, password)
                VALUES ($1, $2, $3, $4,$5,$6)`,
            [type,id,name, email,desg, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
             
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/users/login");
            }
          );
        
      
    

}
});

app.post('/search', searchupload.single('photo'), (req, res) => {
 var images=sql_helper.get_images();
 rows=JSON.stringify(images);
       
      
    let options = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
      //scriptPath: 'path/to/my/scripts', //If you are having python_test.py script in same folder, then it's optional.
    args: [req.file.path,rows] //An argument which can be accessed in the script using sys.argv[1]
    };
    PythonShell.run('face.py', options, function (err, result){
    if (err) throw err;
    // result is an array consisting of messages collected
    //during execution of script.
    console.log('result: ', result.toString());
    res.send(result.toString())
    
    });
   
 
 
  
}
);


app.post("/add_offender", upload.single('photo'), (req, res, next)=>{
  console.log(req.body);
    date=new Date().toDateString();
  
    
    let { name, age, gender,date_committed,category,othercategory,region,otherregion, victim_age,victim_gender} = req.body;
    
    let Offender=new offender(req.user.user_id,age,gender,date,name);
    let Location=new location(region);
    let Offence=new offence();
    Offence.date_committed=date_committed;
    Offence.user_id=req.user.user_id;
    let Image=new image();
    Image.path=req.file.path;
    let Victim = new victim();
    Victim.age=victim_age;
    Victim.gender=victim_gender;
   
    if (category=='OtherCategory'){
     
      category=(string_utility.titleCase(othercategory));
      let Category=new categories(category);
      sql_helper.new_category(Category,function(err,results){
    
     
        if (err==undefined){
          Offence.category_id=results;
          console.log('6',Offence);
        }
  
      
      });
     
      
    }
    else if (category!='OtherCategory'){
     
      let Category=new categories(category);
      sql_helper.get_category_id(Category,function(err,results){
    
     
        if (err==undefined){
          Offence.category_id=results;
          console.log('5',Offence);
         
        }
  
      
      });
     
      
    }
   
    if (region=='OtherRegion'){
      region=(string_utility.titleCase(otherregion));
      let Location=new location(region);
      sql_helper.new_location(Location,function(err,results){
    
     
        if (err==undefined){
          Offence.loc_id=results;
          console.log('1',Offence);
         
        }
  
      
      });
     
      
    }
    else if (region!='OtherRegion'){
     
      let Location=new location(region);
      sql_helper.get_loc_id(Location,function(err,results){
    
     
        if (err==undefined){
          Offence.loc_id=results;
          console.log('2',Offence);
         
        }
  
      
      });
     
      
    }
   
   
  

  
    
   
    sql_helper.add_offender(Offender,function(err,results){
    
     
      if (err==undefined){
        Offence.offender_id=results;
        console.log('3',Offence);
        Image.offender_id=results;
        sql_helper.add_offender_image(Image);
        sql_helper.add_victim(Victim,function(err,results){
          console.log('123',Victim);
           console.log(err);
          if (err==undefined){
            Offence.victim_id=results;
            console.log('4',Offence);
            sql_helper.add_offence_details(Offence);
          }
      
        
        });
       
      }

    
    });

   
    
   
   

  
 
   //let Offence=new offence(req.user.user_id,offender_id,loc_id,date_committed,category,is_category_new,victim_id);
 
  
   
  }
);

 app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



