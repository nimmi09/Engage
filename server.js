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
app.get("/accept/:uid", checkNotAuthenticated, (req, res) => {
  
  client.query(
    `SELECT * FROM temp
      WHERE user_id = $1`,
    [req.params.uid],
    (err, results) => {
      if (err) {
        
        console.log(err);
      }
      id=results.rows[0].user_id
      console.log('id',id)
      //console.log(results.rows);
      client.query(
        `INSERT INTO users (user_id,user_name, email,user_designation, password)
            VALUES ($1, $2, $3, $4)`,
        [id,name, email,desg, hashedPassword],
        (err, results1) => {
          if (err) {
            throw err;
          }
          //console.log(results.rows);
        }
      );
    
    });
    }
  );
  
app.get("/reject/:uid", checkNotAuthenticated, (req, res) => {
  
});

app.get("/users/requests", checkNotAuthenticated, (req, res) => {
  
  client.query(
  `SELECT * FROM temp`,
  
  (err, results) => {
    if (err) {
      
      console.log(err);
    }
    
    requests=Array.from(results.rows);
    console.log(requests);
    
    res.render("requests.ejs",{requests});
    
  }
);

  
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  
  res.render("dashboard.ejs", { user: req.user.name });
});

app.get("/users/logout", (req, res) => {
  req.logout();
  res.render("index.ejs", { message: "You have logged out successfully" });
});

app.post("/users/register", async (req, res) => {
  let { name, email,desg, password, password2 } = req.body;
  
  let errors = [];

 


  

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    //console.log('123')
    res.render("register.ejs", { errors, name, email,desg, password, password2 });
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
            `INSERT INTO temp (user_name, email,user_designation, password)
                VALUES ($1, $2, $3, $4)`,
            [name, email,desg, hashedPassword],
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
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

