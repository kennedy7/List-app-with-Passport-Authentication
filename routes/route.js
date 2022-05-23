const express = require("express");
const router = express.Router();
const { registerUser, ResetPassword, UpdatePassword } = require("../controllers/controller");
const passport = require("passport");
const sendEmail = require("../controllers/controller")





router.get("/", (req, res) => {
  res.render("index");
});
router.get("/users/register", (req, res) => {
  res.render("register");
});
router.get("/users/login", (req, res) => {
  res.render("login");
});

router.get("/users/dashboard", (req, res) => {
  res.render("dashboard", { user: req.user.name });
});

router.post("/users/register", registerUser, (req, res) => {
  if (err) {
    console.log(err);
    return res.status(500).json({ err });
  } else {
    res.render("login");
  }
});




router.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

//reset password routes
router.get("/users/passwordreset", (req, res) => {
  res.render("passwordreset");
});



//google authentication
const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID =
  "523756531198-lc3he8g9ca5ktu6508bhshvb1c40klch.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
//google Auth login route
router.post("/login", checkAuthenticated, (req, res) => {
  let token = req.body.token;
  console.log(token);

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    console.log(payload);
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }
  verify()
    .then(() => {
      res.cookie("session-token", token);
      res.send("success");
    })
    .catch(console.error);
});

router.get("/users/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "you have logged out");
  res.redirect("/users/login");
});
router.get("/logout", (req, res) => {
  res.clearCookie("session-token");
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  if (req.user) {
    next();
  }
  
 else{
  req.flash('success_msg', 'You need to be authenticated to access this page');
  res.redirect("/users/login");
  
}
}


router.post("/users/passwordreset",  ResetPassword)

router.get("/users/newpasswordpage", (req, res) => {
  res.render("newpasswordpage", {token: req.query.token }
  );
})
router.post("/users/newpasswordpage", UpdatePassword);





module.exports = { router };
