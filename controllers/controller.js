const { pool } = require("../dbConfig");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const passport = require("passport");
var randtoken = require("rand-token");
const nodemailer = require("nodemailer");

//MAIL SETUP
function sendEmail(email, token) {
  var email = email;
  var token = token;

  var mail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mynodemailtestmail@gmail.com",
      pass: "Nodemailer",
    },
  });

  var mailOptions = {
    from: "mynodemailtestmail@gmail.com",
    to: email,
    subject: "Reset Password Link - myApp.com",
    html:
      '<p>You requested for reset password, kindly use this <a href="http://localhost:5000/users/newpasswordpage?token=' +
      token +
      '">link</a> to reset your password </p>',
  };
  mail.sendMail(mailOptions, (error, data) => {
    if (error) {
      console.log("mailing error");
    } else {
      console.log("Email sent successfully:" + data.response);
    }
  });
}

exports.registerUser = async function (req, res) {
  const {
    name,
    email,
    password,
    password2
  } = req.body;
  
  console.log({
    name,
    email,
    password,
    password2,
  });

  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({
      message: "please enter all fields"
    });
  }
  if (password.length < 6) {
    errors.push({
      message: "password should be atleast 6 characters"
    });
  }
  if (password != password2) {
    errors.push({
      message: " passwords do not match"
    });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors
    });
  } else {
    //Form validation successful
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    pool.query(
      `SELECT * FROM users
    WHERE email  = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({
            message: "Email already exist"
          });
          res.render("register", {
            errors
          });
        } else {
          pool.query(
            `INSERT INTO users(name, email, password)
                VALUES($1, $2, $3)
                RETURNING id, password`,
            [name, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "you are now registered, Please login");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
};


exports.ResetPassword = function (req, res) {
  var email = req.body.email;
  console.log(email);
  
    pool.query(
      `SELECT * FROM users
      WHERE email  = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          
          const token = randtoken.generate(20);
           var sent = sendEmail(email, token);

          if (sent != "mailing error"){
            const data = { token: token };

            pool.query(
              `UPDATE users SET token=$1 WHERE email =$2`,
              [data, email],
              (err, results) => {
                if (err) 
                  throw err;
              });
            console.log(results.rows);
            req.flash(
              "success_msg",
              "Your Password Reset link has been sent to your email"
            );
            console.log(res.headersSent)
           return res.render("index");
    
          } else{
            
            req.flash("error", "something went wrong, pls try again");
            res.render("passwordreset");
          } 
        }
        req.flash("error", "Email doesnt exist");
        res.render("passwordreset");
        console.log(res.headersSent)
      }
    )};


exports.UpdatePassword = function (req, res) {
  const { token, password, password2 } = req.body;
  console.log({
    token,
    password,
    password2,
  });

  let errors = [];

  if (!password || !password2) {
    errors.push({ message: "please enter all fields" });
  }
  if (!token) {
    errors.push({
      message:
        "no token found/ token expired, click on the forgot password link sent to your mail if registered",
    });
  }

  if (password.length < 6) {
    errors.push({ message: "password should be atleast 6 characters" });
  }
  if (password != password2) {
    errors.push({ message: " passwords do not match" });
  }
  if (errors.length > 0) {
    res.render("newpasswordpage", { errors });
  } else {
    info = {
      token: token,
    };
    pool.query(
      `SELECT * FROM users WHERE token =$1`,
      [info],
      async (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          let hashed = await bcrypt.hash(password, 10);
          console.log(hashed);
          pool.query(
            `UPDATE users SET password=$1 WHERE email=$2`,
            [hashed, results.email],
            function (err, results) {
              if (err) throw err;
            }
          );
          console.log(results.rows);
          req.flash(
            "success_msg",
            "Your Password has been changed successfully, now Login"
          );
          res.redirect("/users/newpasswordpage");
        } else {
          console.log("2");
          req.flash("error", "invalid link, pls try again");
          res.render("newpasswordpage", { errors });
        }
      }
    );
  }
};
