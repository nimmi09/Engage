const express = require("express");
//const { client } = require("./dbConfig");
const { client }= require("./database");

const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const initializePassport = require("./passport-config");

initializePassport(passport);
client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})
// Middleware

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

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
app.get("/users/super", checkAuthenticated, (req, res) => {
  res.render("super.ejs");
});
app.get("/accept/:uid", checkNotAuthenticated, (req, res) => {
  
  client.query(
    `SELECT * FROM temp
      WHERE user_id = $1`,
    [req.params.uid],
    (err, results) => {
      if (err) {
        
        console.log(err);
      }
      type=results.rows[0].type
      id=results.rows[0].user_id
      name=results.rows[0].user_name
      email=results.rows[0].email
      desg=results.rows[0].user_designation
      hashedPassword=results.rows[0].password
      
      //console.log(results.rows);
      client.query(
        `INSERT INTO users (type,user_id,user_name, email,user_designation, password)
            VALUES ($1, $2, $3, $4,$5,$6)`,
        [type,id,name, email,desg, hashedPassword],
        (err, results1) => {
          if (err) {
            throw err;
          }
          console.log(results1.rows);
        }
      );
      client.query(
        `DELETE from temp WHERE user_id=$1`,
        [id],
        (err, results1) => {
          if (err) {
            throw err;
          }
          console.log(results1.rows);
        }
      );
    
    });
    res.redirect("/users/super");
    }
  );
  
app.get("/reject/:uid", checkNotAuthenticated, (req, res) => {
  client.query(
    `DELETE from temp WHERE user_id=$1`,
    [req.params.uid],
    (err, results) => {
      if (err) {
        throw err;
      }
     
    }
  );
  //res.redirect("/users/requests");
});

app.get("/users/requests/:type", checkNotAuthenticated, (req, res) => {
  if(req.params.type=='user' && req.user.type=='admin' || req.user.type=='super'){
  client.query(
  `SELECT * FROM temp where type=$1`,
  [req.params.type],
  
  (err, results) => {
    if (err) {
      
      console.log(err);
    }
    
    requests=Array.from(results.rows);
    console.log(requests);
    
    res.render("requests.ejs",{requests});
    
  }
);
 
}
else {
  res.render("error.ejs");
} 
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  console.log(req.session.flash.error);
  res.render("login.ejs");
});


app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  
  res.render("dashboard.ejs");
});
app.get("/users/admin", checkNotAuthenticated, (req, res) => {
  
  res.render("admin.ejs");
});
app.get("/users/super", checkNotAuthenticated, (req, res) => {
  
  res.render("super.ejs");
});
app.get("/users/superd", checkNotAuthenticated, (req, res) => {
  
  res.render("superd.ejs");
});

app.get("/users/logout", (req, res) => {
  req.logout();
  res.render("index.ejs", { message: "You have logged out successfully" });
});

app.post("/users/register", async (req, res) => {
  let {type, name, email,desg, password, password2 } = req.body;
  
  let errors = [];

 


  

  

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    //console.log('123')
    res.render("register.ejs", { errors,type, name, email,desg, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    //console.log(hashedPassword)
    // Validation passed
  
    client.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          //console.log('error')
          console.log(err);
        }
        
        

        if (results.rows.length > 0) {
          //console.log('show')
          return res.render("register", {
            message: "Email already registered"
          });
        } else {
          //console.log('inserting')
          client.query(
            `INSERT INTO temp (type,user_name, email,user_designation, password)
                VALUES ($1, $2, $3, $4,$5)`,
            [type,name, email,desg, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
             
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/users/login");
            }
          );
        }
      }
    ); 

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



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

